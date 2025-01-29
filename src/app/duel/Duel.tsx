"use client";

import CheckmarkIcon from "@/components/common/checkmark";
import TextBox from "@/components/common/textbox";
import WrongIcon from "@/components/common/wrong";
import { MathJaxConfig } from "@/../backend/src/util/types";
import { FULL_POINTS, GameState, NUM_TRIES, ServerState, DuelUserData, WSMessage } from "@/../backend/src/util/gametypes";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { getTimeColor } from "@/components/game";
import { getNumberRankStr } from "@/../backend/src/util/generator";
import { getHost } from "./duelhelper";
import { useRouter } from "next/navigation";

const devMode = process.env.NODE_ENV === "development" && false

const shouldShowCorrect = (serverState: ServerState) => {
    return serverState === ServerState.IN_PROGRESS || serverState === ServerState.WAITING_NEXT;
};

// Recursively adds properties from newObj to obj, deleting the key if the new value is 'null'
const recursiveUpdate = (obj: any, newObj: any) => {
    if (typeof obj !== "object" || typeof newObj !== "object")
        return;
    for (const key in newObj) {
        if (newObj[key] === null)
            delete obj[key];
        else if (typeof newObj[key] === "object" && obj[key] !== undefined) {
            recursiveUpdate(obj[key], newObj[key]);
        }
        else
            obj[key] = newObj[key];
    }
};

const statusTexts: {[key: number]: string} = {
    [ServerState.CANNOT_START]: "Waiting for players",
    [ServerState.WAITING_START]: "Starting soon",
    [ServerState.WAITING_QUESTION]: "Get ready",
    // These two will display the question/answer and aren't needed here
    // [ServerState.IN_PROGRESS]: "Type the answer",
    // [ServerState.WAITING_NEXT]: "Results",
    [ServerState.ENDING_GAME]: "Game over",
}

function Initializing() {
    return (
        <div className="loading">
            Connecting to server
        </div>
    );
}

function EnteringGame({ onJoinGame, onJoinGameAsGuest, errorMessageRef, loading, isSignedIn } : { onJoinGame: () => void, onJoinGameAsGuest: () => void, errorMessageRef: React.MutableRefObject<string | undefined>, loading: boolean, isSignedIn: boolean }) {
    return (
        <div>
            <h2>Choose an option</h2>
            <div className="flex flex-row gap-x-4 my-4 justify-center">
                <button onClick={onJoinGame}>{ isSignedIn ? "Enter" : "Login" }</button>
                <button onClick={onJoinGameAsGuest}>Play as Guest</button>
            </div>
            { loading && <div className="loading">Loading</div> }
            { errorMessageRef.current && <div className="text-red-500">{errorMessageRef.current}</div> }
        </div>
    );
}

function DuelTimer({ startTime, timer, text, showTime }: { startTime: number, timer: number, text: string, showTime: boolean }) {
    const [time, setTime] = useState(timer);
    
    useEffect(() => {
        setTime(timer);
        const interval = setInterval(() => {
            setTime(Math.max(0, timer - (Date.now() - startTime) / 1000));
        }, 100);
        return () => clearInterval(interval);
    }, [startTime, timer]);

    return (
        <div className="flex flex-row gap-x-2 justify-center">
            <div>{text}</div>
            <div>{ showTime && time && time !== 0 ? time.toFixed(1) : "..." }</div>
        </div>
    );
}

const getPointsColor = (points: number) => {
    const ratio = points / FULL_POINTS;
    const blueEnd = .9, green = .75, yellow = .5, redEnd = 0;
    const r = Math.max(0, Math.min(1, (green - ratio) / (green - yellow))) * 0xff;
    const g = Math.max(0, Math.min(1, 1 - (yellow - ratio) / (yellow - redEnd))) * 0xff;
    const b = Math.max(0, Math.min(1, 1 - (blueEnd - ratio) / (blueEnd - green))) * 0xff;
    return `rgb(${r}, ${g}, ${b})`;
};

const getTriesColor = (tries: number) => {
    if (tries == NUM_TRIES)
        return "";
    if (tries == NUM_TRIES - 1)
        return "#ff0";
    if (tries == NUM_TRIES - 2)
        return "#f80";
    return "#f00";
}

function Players({ usernameRef, playerData, serverState }: { usernameRef: React.MutableRefObject<string>, playerData: { [key: string]: DuelUserData }, serverState: ServerState }) {
    return (
        <div>
            <h2 className="mt-2 mb-1">Players</h2>
            <div className="flex flex-col items-center gap-y-0.5">
                { Object.entries(playerData).sort((a, b) => a[1].points == b[1].points ? a[1].username.localeCompare(b[1].username) : b[1].points - a[1].points).map(([id, player], i) =>
                    <div key={id} className={twMerge("w-fit px-1.5 py-0.5 rounded-md", shouldShowCorrect(serverState) && player.answeredCorrect ? "border-green-600 border-3 border-solid" : "")}>
                        <span>{getNumberRankStr(i + 1)}. </span>
                        { player.inGame
                            ? <span>
                                {
                                    player.username === usernameRef.current ? player.username + " (You)" : player.username
                                }: {player.points.toFixed(1)}
                                {
                                    serverState == ServerState.WAITING_NEXT && <span>
                                        <span style={{ color: getPointsColor(player.delta) }}> +{player.delta.toFixed(1)}</span>
                                        {
                                            player.answeredCorrect && <span> — <span style={{ color: getTriesColor(player.tries) }}>{getNumberRankStr(NUM_TRIES + 1 - player.tries)} try</span></span>
                                        }
                                    </span>
                                }
                                </span>
                            : <span>(<span className="loading">Joining</span>)</span>
                        }
                    </div>
                ) }
            </div>
        </div>
    )
}

export default function Duel({ reset, token }: { reset: () => void, token?: string }) {
    const router = useRouter();
    const [_, _upd] = useState(0);
    // const [initialized, setInitialized] = useState(true);
    const [loading, setLoading] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [disconnected, setDisconnected] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const usernameRef = useRef<string>("");
    const errorMessageRef = useRef<string | undefined>("");

    const startTimeRef = useRef<number>(0);
    const gameDataRef = useRef<GameState>({ timer: 0, startTime: 0, question: "", rounds: 0 });
    const gameData = gameDataRef.current;
    const playerDataRef = useRef<{ [key: string]: DuelUserData }>({});
    const playerData = playerDataRef.current;
    const myPlayerData = Object.values(playerData).find(player => player.username === usernameRef.current);
    const serverStateRef = useRef<ServerState>(ServerState.CANNOT_START);
    const serverState = serverStateRef.current;
    const answerRequestRef = useRef<number>(0);
    const responseRef = useRef<{ feedback: string, time: number }>({feedback: "", time: 0});

    const textBoxRef = useRef<string>("");

    const isCorrect = shouldShowCorrect(serverState) && myPlayerData && myPlayerData.answeredCorrect;
    const isWrong = shouldShowCorrect(serverState) && myPlayerData && myPlayerData.tries < NUM_TRIES;

    let textboxEndContent: React.ReactNode | null = null;
    if (shouldShowCorrect(serverState)) {
        if (isCorrect)
            textboxEndContent = <CheckmarkIcon className="mr-1" />;
        else if (answerRequestRef.current > 0)
            textboxEndContent = <span className="loading-spinner mr-2" />;
        else if (isWrong)
            textboxEndContent = <WrongIcon className="mr-1" />;
    }

    const onEnterPressed = () => {
        // Ignore if game is not in progress
        if (serverState !== ServerState.IN_PROGRESS)
            return;
        // Ignore blank input
        if (!textBoxRef.current)
            return;
        // Ignore if already answered correctly
        if (isCorrect)
            return;
        // Show error message if player is out of tries
        if (myPlayerData && myPlayerData.tries <= 0) {
            errorMessageRef.current = "No more tries";
            forceUpdate();
            return;
        }
        if (wsRef.current)
            sendMessage({ type: "response", data: textBoxRef.current });
        textBoxRef.current = "";
        answerRequestRef.current++;
        forceUpdate();
    };

    const forceUpdate = () => _upd(x => x + 1);
    
    const sendMessage = useCallback((message: WSMessage) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === ws.OPEN)
            ws.send(JSON.stringify(message));
    }, []);

    const connectToWebSocket: (token: string) => Promise<boolean> = async (token) => {
        if (wsRef.current || !getHost || inGame)
            return false;
        const host = await getHost();
        console.log(host);
        if (!host)
            return false;
        // TODO send secure token (or not) to websocket
        const ws = wsRef.current = new WebSocket(host);
        ws.onmessage = (event) => {
            const eventData: WSMessage[] = JSON.parse(event.data);
            for (const messageData of eventData) {
                const { type, data, error } = messageData;
                switch (type) {
                case "username":
                    if (!data) {
                        errorMessageRef.current = error;
                        setLoading(false);
                        return;
                    }
                    usernameRef.current = data;
                    setInGame(true);
                    setLoading(false);
                    break;
                case "players":
                    recursiveUpdate(playerDataRef.current, data);
                    break;
                case "game":
                    recursiveUpdate(gameDataRef.current, data);
                    if (data.startTime && Math.abs(Date.now() - data.startTime) < 1000)
                        startTimeRef.current = Date.now();
                    else
                        startTimeRef.current = data.startTime;
                    break;
                case "state":
                    serverStateRef.current = data;
                    errorMessageRef.current = "";
                    break;
                case "response":
                    if (data) {
                        responseRef.current = data;
                        // If answered correctly
                        // TODO correct effects
                    }
                    else {
                        // If answered incorrectly or error
                        // warn(data.error!);
                    }
                    answerRequestRef.current--;
                    break;
                case "error":
                    errorMessageRef.current = data;
                    break;
                }
                if (devMode)
                    console.log("Received", messageData);
            }
            forceUpdate();
        };
        ws.onopen = () => {
            // setInitialized(true);
            console.log("Opened");
            sendMessage({ type: "auth", data: token });
        };
        ws.onclose = () => {
            console.log("Closed");
            errorMessageRef.current = "Connection closed";
            if (devMode)
                reset();
            else
                setDisconnected(true);
        };
        return true;
    }

    const onJoinGame = async (secureToken: string) => {
        if (inGame || loading)
            return;
        errorMessageRef.current = "";
        setLoading(true);
        const success = await connectToWebSocket(secureToken);
        if (success)
            setInGame(true);
        setLoading(false);
    };

    const onJoinGameUser = () => {
        if (token)
            onJoinGame(token);
        else
            router.push(encodeURI(`/login?redirect=${encodeURIComponent("/duel")}`));
    };

    const onJoinGameAsGuest = () => {
        onJoinGame("");
    };

    useEffect(() => {
        return () => wsRef.current?.close();
    }, []);

    const doLog = () => {
        console.log(playerData, gameData);
    };

    return (
        <div>
            {
                // !initialized ? <Initializing /> : 
                !inGame ? <EnteringGame onJoinGame={onJoinGameUser} onJoinGameAsGuest={onJoinGameAsGuest} errorMessageRef={errorMessageRef} loading={loading} isSignedIn={token !== undefined} /> :
                    <div>
                        { [ServerState.WAITING_QUESTION, ServerState.IN_PROGRESS, ServerState.WAITING_NEXT].includes(serverState) && <div className="text-3xl">Round {gameData.rounds}</div> }
                        <DuelTimer startTime={startTimeRef.current} timer={gameData.timer} text="Time:" showTime={serverState !== ServerState.CANNOT_START} />
                        <MathJaxContext config={MathJaxConfig}>
                            <MathJax id="question" className="my-4" dynamic>{
                                serverState === ServerState.IN_PROGRESS
                                    ? gameData.question
                                    : serverState === ServerState.WAITING_NEXT
                                        ? "Answer: " + gameData.question
                                        : statusTexts[serverState]
                            }</MathJax>
                        </MathJaxContext>
                        <div className="flex-center my-2">
                            <TextBox className={
                                isCorrect ? "bg-green-100 hover:bg-green-100" : answerRequestRef.current === 0 && isWrong ? "bg-red-100 hover:bg-red-100" : ""
                            } valueRef={textBoxRef} onEnter={onEnterPressed} endContent={textboxEndContent} />
                        </div>
                        { errorMessageRef.current && <div className="text-red-500">{errorMessageRef.current}</div> }
                        { shouldShowCorrect(serverState) && (
                            isCorrect
                                ? <div>{responseRef.current.feedback} <span style={{ color: getTimeColor(responseRef.current.time * 1000) }}>({responseRef.current.time.toFixed(1)}s)</span></div>
                                : <div>{myPlayerData ? myPlayerData.tries : "?"} {myPlayerData?.tries !== 1 ? "tries" : "try"} left</div>
                        ) }
                        { devMode && <div>Game Data: {JSON.stringify(gameData)}</div> }
                        <br/>
                    </div>
            }
            { /*initialized &&*/ <Players usernameRef={usernameRef} playerData={playerData} serverState={serverState} /> }
            { devMode && <button onClick={doLog}>Log</button> }
            { disconnected &&
                <div className="absolute m-auto top-0 w-full h-full bg-[rgba(0,0,0,.7)] py-8 box-border">
                    <div className="text-red-400 text-4xl font-bold">Disconnected from server</div>
                    <div>Error Message: {errorMessageRef.current || "none"}</div>
                    <br/>
                    <button onClick={reset}>Refresh</button>
                </div>
            }
        </div>
    );
}