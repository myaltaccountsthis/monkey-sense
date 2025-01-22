import { WebSocket, RawData } from "ws";
import { randomUUID } from "crypto";
import EventEmitter from "events";
import { getAnswerDisplay, judgeQuestion, QuestionGeneratorList, RNG } from "./util/generator";
import { defaultQuestion, Question } from "./util/types";
import { UserData, GameState, ServerState, WSMessage, NUM_TRIES, FULL_POINTS } from "./util/gametypes";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 50;
const MAX_ROUNDS = 20;
const WAIT_TIME = 3, ANSWER_TIME = 30, ANSWER_TIME_SKIPPED = 10, RESULTS_TIME = 5, ENDING_GAME_TIME = 10;

export class Game {
    clients: {[key: string]: WebSocket};
    players: {[key: string]: UserData};
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
        this.events.on("connect", (id: string) => {
            this.updatePlayer(id);
            this.sendAllClients([{ type: "players", data: { [id]: this.players[id] }}], id);
        });
        this.events.on("disconnect", (id: string) => {
            this.sendAllClients([{ type: "players", data: { [id]: null }}]);
        });
        this.events.on("message", (id: string, data: WSMessage) => {
            try {
                switch (data.type) {
                case "username": {
                    if (this.players[id].username) {
                        console.warn("Username already set to", this.players[id].username);
                        this.sendClient("Username already set", [{ type: "username", data: false, error: "Username already set" }]);
                        break;
                    }
                    if (data.data.length === 0) {
                        this.sendClient(id, [{ type: "username", data: false, error: "Username is empty" }]);
                        break;
                    }
                    if (Object.values(this.players).map(user => user.username).includes(data.data)) {
                        this.sendClient(id, [{ type: "username", data: false, error: "Username already taken" }]);
                        break;
                    }
                    this.players[id].username = data.data;
                    this.players[id].inGame = true;
                    this.sendClient(id, [{ type: "username", data: data.data }, { type: "players", data: { [id]: this.players[id] }}]);
                    this.sendAllClients([{ type: "players", data: { [id]: this.players[id] }}], id);
                    this.checkMinPlayers();
                    console.log("Set %s's username to %s", id, data.data);
                    break;
                }
                case "response": {
                    if (this.currentState !== ServerState.IN_PROGRESS) {
                        console.warn("Received response when not in progress");
                        this.sendClient(id, [{ type: "response", data: false, error: "Not in progress" }]);
                        break;
                    }
                    if (this.players[id].tries <= 0) {
                        console.warn("Received response when out of tries");
                        this.sendClient(id, [{ type: "response", data: false, error: "Out of tries" }]);
                        break;
                    }
                    const judgement = judgeQuestion(this.currentQuestion, data.data);
                    if (!judgement.correct) {
                        this.players[id].tries--;
                        this.sendClient(id, [{ type: "players", data: { [id]: { tries: this.players[id].tries } }}, { type: "response", data: false, error: "Incorrect" }]);
                        this.sendAllClients([{ type: "chat", data: { userData: this.players[id], body: data.data, type: "incorrect" }}]);
                        this.checkSkip();
                        break;
                    }
                    const t = Date.now();
                    const endT = t + ANSWER_TIME_SKIPPED * 1000;

                    this.players[id].answeredCorrect = true;
                    this.players[id].delta = this.getGainedPoints(this.players[id].tries);
                    this.sendClient(id, [{ type: "response", data: { feedback: judgement.other || "Correct", time: (t - this.originalStartTime) / 1000 } }]);
                    this.sendAllClients([{ type: "chat", data: { userData: this.players[id], body: "", type: "correct" }}]);
                    const messages: WSMessage[] = [];
                    messages.push({ type: "players", data: { [id]: this.players[id] }});
                    
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

    canJoin(id: string) {
        return this.players[id].username !== "";
    }

    checkSkip() {
        if (Object.values(this.players).filter(player => player.inGame).every(player => player.answeredCorrect || player.tries === 0)) {
            this.gameState.timer = 0;
            return true;
        }
        return false;
    }

    // Make sure player is up to date on everything (called when player joinds)
    updatePlayer(id: string) {
        this.sendClient(id, [{ type: "players", data: this.players }, { type: "game", data: this.gameState }, { type: "state", data: this.currentState }]);
    }

    numPlayersInGame() {
        return Object.values(this.players).filter(player => player.inGame).length;
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
            messages.push({ type: "game", data: { rounds: this.gameState.rounds } });
            messages.push(...this.setTimer(WAIT_TIME));
            break;

        case ServerState.IN_PROGRESS:
            this.currentQuestion = this.questionGen.generateQuestion({ gameMode: "Number Sense", lastT: 0, total: 0, testLength: 0, question: defaultQuestion, enterMode: "Default" }).question;
            for (const user of Object.values(this.players)) {
                user.tries = NUM_TRIES;
                user.answeredCorrect = false;
                user.delta = 0;
            }
            // Set prev points to a large number
            this.prevPoints = FULL_POINTS * 100;
            this.originalStartTime = Date.now();
            this.gameState.question = this.currentQuestion.str;
            messages.push({ type: "game", data: { question: this.currentQuestion.str } });
            messages.push({ type: "players", data: this.players });
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
            messages.push(...this.setTimer(ENDING_GAME_TIME));
            break;
        }
        messages.push({ type: "state", data: newState });
        this.sendAllClients(messages);
        console.log("Changed server state to", newState);
    }

    // WebSocket util

    connect(ws: WebSocket) {
        if (Object.keys(this.clients).length >= MAX_PLAYERS)
            return "";
        
        const id = randomUUID();
        this.clients[id] = ws;
        this.players[id] = { username: "", inGame: false, tries: NUM_TRIES, answeredCorrect: false, points: 0, delta: 0 };
        this.events.emit("connect", id);
        // setTimeout(() => this.players[id] && !this.players[id].inGame && ws.close(), 60000);
        
        return id;
    }

    disconnect(id: string) {
        delete this.clients[id];
        delete this.players[id];
        this.checkMinPlayers();
        this.events.emit("disconnect", id);
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
        return (message: RawData) => this.events.emit("message", id, JSON.parse(Buffer.from(message.slice(0) as Buffer).toString()));
    }
}