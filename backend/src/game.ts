import { WebSocket, RawData } from "ws";
import EventEmitter from "events";
import { getAnswerDisplay, judgeQuestion, QuestionGeneratorList, RNG } from "./util/generator";
import { defaultQuestion, Question, User } from "./util/types";
import { DuelUserData, GameState, ServerState, WSMessage, NUM_TRIES, FULL_POINTS } from "./util/gametypes";
import { pool } from "./util/database";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 50;
const MAX_ROUNDS = 20;
const WAIT_TIME = 3, ANSWER_TIME = 30, ANSWER_TIME_SKIPPED = 10, RESULTS_TIME = 5, ENDING_GAME_TIME = 10;

export class Game {
    clients: {[key: string]: WebSocket};
    players: {[key: string]: DuelUserData};
    gameState: GameState;
    currentState: ServerState;
    currentQuestion: Question;
    prevPoints: number;
    originalStartTime: number;
    questionGen: QuestionGeneratorList;
    events: EventEmitter;
    
    constructor() {
        this.clients = {};
        this.players = {};
        this.gameState = { timer: 10, startTime: 0, question: "", rounds: 0 };
        this.currentState = ServerState.CANNOT_START;
        this.currentQuestion = defaultQuestion;
        this.prevPoints = 0;
        this.originalStartTime = 0;
        this.questionGen = new QuestionGeneratorList(new RNG());
        this.events = new EventEmitter();
    }

    async start() {
        // this.events.on("connect", (id: string) => {
        //     this.updatePlayer(id);
        //     this.sendAllClients([{ type: "players", data: { [id]: this.players[id] }}], id);
        // });
        // this.events.on("disconnect", (id: string) => {
        //     this.sendAllClients([{ type: "players", data: { [id]: null }}]);
        // });
        this.events.on("message", (id: string, data: WSMessage) => {
            try {
                switch (data.type) {
                case "response": {
                    // Make sure game is in progress
                    if (this.currentState !== ServerState.IN_PROGRESS) {
                        console.warn("Received response when not in progress");
                        this.sendClient(id, [{ type: "response", data: false, error: "Not in progress" }]);
                        break;
                    }
                    // Make sure player has tries left
                    if (this.players[id].tries <= 0) {
                        console.warn("Received response when out of tries");
                        this.sendClient(id, [{ type: "response", data: false, error: "Out of tries" }]);
                        break;
                    }
                    // Make sure player has not already answered
                    if (this.players[id].answeredCorrect) {
                        console.warn("Received response when already answered");
                        this.sendClient(id, [{ type: "response", data: false, error: "Already answered" }]);
                        break;
                    }
                    
                    // Increment player answered stat if first time answering this question
                    // Only runs once since either tries-- or answeredCorrect = true
                    if (this.players[id].tries === NUM_TRIES)
                        this.players[id].sessionAnswered++;

                    // Check answer, decrement tries and return if wrong
                    const judgement = judgeQuestion(this.currentQuestion, data.data);
                    if (!judgement.correct) {
                        this.players[id].tries--;
                        this.sendAllClients([{ type: "players", data: { [id]: { tries: this.players[id].tries } }}, { type: "response", data: false, error: "Incorrect" }]);
                        this.sendAllClients([{ type: "chat", data: { userData: this.players[id], body: data.data, type: "incorrect" }}]);
                        this.checkSkip();
                        break;
                    }

                    // Player answered correctly
                    const t = Date.now();
                    const endT = t + ANSWER_TIME_SKIPPED * 1000;
                    // Update player data
                    this.players[id].answeredCorrect = true;
                    this.players[id].delta = this.getGainedPoints(this.players[id].tries);
                    this.players[id].sessionCorrect++;
                    // Send response to player
                    this.sendClient(id, [{ type: "response", data: { feedback: judgement.other || "Correct", time: (t - this.originalStartTime) / 1000 } }]);
                    this.sendAllClients([{ type: "chat", data: { userData: this.players[id], body: "", type: "correct" }}]);
                    const messages: WSMessage[] = [];
                    messages.push({ type: "players", data: { [id]: this.players[id] }});
                    // Update timer if time can be skipped
                    if (!this.checkSkip() && endT < this.gameState.startTime + this.gameState.timer * 1000) {
                        messages.push(...this.setTimer(ANSWER_TIME_SKIPPED));
                    }
                    this.sendAllClients(messages);
                    break;
                }
                default: {
                    console.log("Received", data);
                    break;
                }
                }
            }
            catch (e) {
                console.error("Error processing message:", e);
            }
        });
        
        // Game loop
        setInterval(() => {
            const t = Date.now();
            if (t - this.gameState.startTime < this.gameState.timer * 1000)
                return;

            switch (this.currentState) {
            case ServerState.WAITING_START:
                this.changeServerState(ServerState.WAITING_QUESTION);
                break;
            case ServerState.WAITING_QUESTION:
                this.changeServerState(ServerState.IN_PROGRESS);
                break;
            case ServerState.IN_PROGRESS:
                this.changeServerState(ServerState.WAITING_NEXT);
                break;
            case ServerState.WAITING_NEXT:
                if (this.numPlayersInGame() < MIN_PLAYERS || this.gameState.rounds >= MAX_ROUNDS)
                    this.changeServerState(ServerState.ENDING_GAME);
                else
                    this.changeServerState(ServerState.WAITING_QUESTION);
                break;
            case ServerState.ENDING_GAME:
                if (this.numPlayersInGame() < MIN_PLAYERS)
                    this.changeServerState(ServerState.CANNOT_START);
                else
                    this.changeServerState(ServerState.WAITING_START);
                break;
            }
        }, 100);
    }

    // Game util
    

    checkSkip() {
        if (Object.values(this.players).filter(player => player.inGame).every(player => player.answeredCorrect || player.tries === 0)) {
            this.gameState.timer = 0;
            return true;
        }
        return false;
    }

    // Make sure player is up to date on everything (called when player joins)
    updatePlayer(id: string) {
        this.sendClient(id, [{ type: "players", data: this.players }, { type: "game", data: this.gameState }, { type: "state", data: this.currentState }]);
    }

    numPlayersInGame() {
        return Object.values(this.players).filter(player => player.inGame).length;
    }

    isFull() {
        return Object.keys(this.clients).length >= MAX_PLAYERS;
    }

    setTimer(time: number) {
        this.gameState.timer = time;
        this.gameState.startTime = Date.now();
        return [{ type: "game", data: { timer: time, startTime: this.gameState.startTime } }];
    }

    checkMinPlayers() {
        if (this.numPlayersInGame() < MIN_PLAYERS) {
            if (this.currentState === ServerState.WAITING_START)
                this.changeServerState(ServerState.CANNOT_START);
        }
        else {
            if (this.currentState === ServerState.CANNOT_START)
                this.changeServerState(ServerState.WAITING_START);
        }
    }

    getGainedPoints(tries: number) {
        const totalT = ANSWER_TIME * 1000;
        const rawPointsFullAcc = FULL_POINTS * (1 - .5 * (Date.now() - this.originalStartTime) / totalT);
        const rawPoints = rawPointsFullAcc * tries / NUM_TRIES;
        this.prevPoints = Math.min(rawPointsFullAcc, this.prevPoints * (1 - .6 / Object.keys(this.players).length));
        const points = Math.round(Math.min(rawPoints, this.prevPoints) * 10) / 10;
        return points;
    }

    async updatePlayerData(player: DuelUserData, didWin: boolean) {
        if (player.user_id <= 0)
            return;
        // Try to update database
        pool.query("UPDATE user_data SET questions_answered = questions_answered + $1, questions_correct = questions_correct + $2, wins = wins + $3 WHERE user_id = $4", [player.sessionAnswered, player.sessionCorrect, Number(didWin), player.user_id]).then(() => {
            player.sessionAnswered = 0;
            player.sessionCorrect = 0;
        }).catch(e => {
            console.warn("Could not update user data for user", player.user_id, e);
        });
    }

    changeServerState(newState: ServerState) {
        if (this.currentState === newState)
            return;
        
        // Send all the messages in bulk, for global messages
        const messages: WSMessage[] = [];
        this.currentState = newState;

        switch (newState) {
        case ServerState.WAITING_START:
            for (const user of Object.values(this.players)) {
                if (user.answeredCorrect)
                    user.points += user.delta;
            }
            this.gameState.rounds = 0;
            messages.push(...this.setTimer(WAIT_TIME));
            messages.push({ type: "players", data: this.players });
            break;

        case ServerState.WAITING_QUESTION:
            this.gameState.rounds++;
            for (const user of Object.values(this.players)) {
                user.tries = NUM_TRIES;
                user.answeredCorrect = false;
                user.delta = 0;
            }
            messages.push({ type: "game", data: { rounds: this.gameState.rounds } });
            messages.push({ type: "players", data: this.players });
            messages.push(...this.setTimer(WAIT_TIME));
            break;

        case ServerState.IN_PROGRESS:
            this.currentQuestion = this.questionGen.generateQuestion({ gameMode: "Number Sense", lastT: 0, total: 0, testLength: 0, question: defaultQuestion, enterMode: "Default" }).question;
            // Set prev points to a large number
            this.prevPoints = FULL_POINTS * 100;
            this.originalStartTime = Date.now();
            this.gameState.question = this.currentQuestion.str;
            messages.push({ type: "game", data: { question: this.currentQuestion.str } });
            messages.push(...this.setTimer(ANSWER_TIME));
            break;

        case ServerState.WAITING_NEXT:
            for (const user of Object.values(this.players)) {
                if (user.answeredCorrect)
                    user.points += user.delta;
            }
            this.gameState.question = getAnswerDisplay(this.currentQuestion);
            messages.push({ type: "game", data: { question: this.gameState.question } });
            messages.push({ type: "players", data: this.players });
            messages.push(...this.setTimer(RESULTS_TIME));
            break;

        case ServerState.ENDING_GAME:
            // Decide winner
            const playerArr = Object.values(this.players);
            playerArr.sort((a, b) => b.points - a.points);
            let winnerId = -1;
            // Don't do anything if there are no players
            if (playerArr.length > 0) {
                const winner = playerArr[0];
                // Only set winner user_id if winner is signed in
                if (winner.user_id > 0)
                    winnerId = winner.user_id;
            }
            // Update player data
            for (const player of playerArr) {
                this.updatePlayerData(player, player.user_id === winnerId);
            }
            messages.push(...this.setTimer(ENDING_GAME_TIME));
            break;
        }
        messages.push({ type: "state", data: newState });
        this.sendAllClients(messages);
        console.log("Changed server state to", newState);
    }

    // WebSocket util

    connect(ws: WebSocket, user: User) {
        const id = this.getUserKey(user.user_id);
        this.clients[id] = ws;
        this.players[id] = { user_id: user.user_id, username: user.username, inGame: true, tries: NUM_TRIES, answeredCorrect: false, points: 0, delta: 0, sessionAnswered: 0, sessionCorrect: 0 };

        this.updatePlayer(id);
        this.sendClient(id, [{ type: "username", data: user.username }]);
        this.sendAllClients([{ type: "players", data: { [id]: this.players[id] }}], id);

        this.checkMinPlayers();
        console.log("%s signed in with username %s", id, user.username);
        
        // this.events.emit("connect", id);
        // setTimeout(() => this.players[id] && !this.players[id].inGame && ws.close(), 60000);
        
        return id;
    }

    disconnect(id: string) {
        // Async save player data
        this.updatePlayerData(this.players[id], false);
        // Delete player from tables
        delete this.clients[id];
        delete this.players[id];
        // Check min players, update player list
        this.checkMinPlayers();
        this.sendAllClients([{ type: "players", data: { [id]: null }}]);

        // this.events.emit("disconnect", id);
    }

    isPlayerConnected(user_id: number) {
        return this.players[this.getUserKey(user_id)] !== undefined;
    }

    getUserKey(user_id: number) {
        return `K=${user_id}`;
    }

    sendClient(id: string, messages: WSMessage[]) {
        this.clients[id].send(JSON.stringify(messages));
    }

    sendAllClients(messages: WSMessage[], ignore?: string) {
        for (const id in this.clients)
            if (id !== ignore)
                this.sendClient(id, messages);
    }

    bindOnMessage(id: string) {
        return (message: RawData) => {
            try {
                this.events.emit("message", id, parseWebSocketMessage(message));
            }
            catch (e) {
                console.warn(e);
            }
        };
    }
}

export function parseWebSocketMessage(message: RawData): WSMessage {
    const data = JSON.parse(Uint8Array.prototype.slice.call(message).toString());
    if (typeof data.type !== "string")
        throw "Type is not a string";
    return data;
}