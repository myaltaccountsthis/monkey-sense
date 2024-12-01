"use client";

import CheckmarkIcon from "@/components/checkmark";
import TextBox from "@/components/textbox";
import WrongIcon from "@/components/wrong";
import { MathJaxConfig } from "../../../backend/src/util/types";
import { GameState, NUM_TRIES, ServerState, UserData, WSMessage } from "../../../backend/src/util/gametypes";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { useEffect, useRef, useState } from "react";

const devMode = process.env.NODE_ENV === "development" && false;

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

function EnteringGame({ usernameRef: valueRef, onJoinGame, errorMessageRef, loading } : { usernameRef: React.MutableRefObject<string>, onJoinGame: () => void, errorMessageRef: React.MutableRefObject<string | undefined>, loading: boolean }) {
    const [_, forceUpdate] = useState(0);
    const onInput = (e: React.FormEvent<HTMLInputElement>) => {
        valueRef.current = e.currentTarget.value;
        forceUpdate(x => x + 1);
    };
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter")
            onJoinGame();
    };
    return (
        <div>
            <input className="rounded-md border-2 border-black border-solid bg-gray-100 hover:bg-gray-200 inputbox" name="username" id="username" type="text" onInput={onInput} onKeyDown={onKeyDown} value={valueRef.current} placeholder={"Enter your username"} />
            <br/>
            <button className="my-4" onClick={onJoinGame}>Start</button>
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

function Players({ usernameRef, playerData }: { usernameRef: React.MutableRefObject<string>, playerData: { [key: string]: UserData } }) {
    return (
        <div>
            <h2>Players</h2>
            <div>
                { Object.entries(playerData).map(([id, player]) =>
                    player.inGame ?
                    <div key={id}>{player.username === usernameRef.current ? player.username + " (You)" : player.username}</div> :
                    <div key={id}>(<span className="loading">Joining</span>)</div>
                ) }
            </div>
        </div>
    )
}

export default function Duel({ getHost, reset }: { getHost: () => Promise<string>, reset: () => void; }) {
    const [_, _upd] = useState(0);
    const [initialized, setInitialized] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [disconnected, setDisconnected] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const usernameRef = useRef<string>("");
    const errorMessageRef = useRef<string | undefined>("");

    const startTimeRef = useRef<number>(0);
    const gameDataRef = useRef<GameState>({ timer: 0, startTime: 0, question: "", rounds: 0 });
    const gameData = gameDataRef.current;
    const playerDataRef = useRef<{ [key: string]: UserData }>({});
    const playerData = playerDataRef.current;
    const myPlayerData = Object.values(playerData).find(player => player.username === usernameRef.current);
    const serverStateRef = useRef<ServerState>(ServerState.CANNOT_START);
    const serverState = serverStateRef.current;
    const answerRequestRef = useRef<number>(0);

    const textBoxRef = useRef<string>("");

    const isCorrect = serverState === ServerState.IN_PROGRESS && myPlayerData && myPlayerData.answeredCorrect;
    const isWrong = serverState == ServerState.IN_PROGRESS && myPlayerData && myPlayerData.tries < NUM_TRIES;

    let textboxEndContent: React.ReactNode | null = null;
    if (serverState == ServerState.IN_PROGRESS) {
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
        forceUpdate();
    };

    const forceUpdate = () => _upd(x => x + 1);
    
    const sendMessage = (message: WSMessage) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === ws.OPEN)
            ws.send(JSON.stringify(message));
    }

    const onJoinGame = () => {
        if (inGame)
            return;
        sendMessage({ type: "username", data: usernameRef.current });
        errorMessageRef.current = "";
        setLoading(true);
    };

    useEffect(() => {
        let shouldClear = false;
		(async () => {
            if (wsRef.current || !getHost)
                return;
            const ws = wsRef.current = new WebSocket(await getHost());
            if (shouldClear) {
                ws.close();
                wsRef.current = null;
                return;
            }
			ws.onmessage = (event) => {
                const data: WSMessage = JSON.parse(event.data);
                switch (data.type) {
                case "username":
                    if (!data.data) {
                        errorMessageRef.current = data.error;
                        setLoading(false);
                        return;
                    }
                    usernameRef.current = data.data;
                    setInGame(true);
                    setLoading(false);
                    break;
                case "players":
                    recursiveUpdate(playerDataRef.current, data.data);
                    forceUpdate();
                    break;
                case "game":
                    recursiveUpdate(gameDataRef.current, data.data);
                    if (data.data.startTime) {
                        startTimeRef.current = Date.now();
                    }
                    forceUpdate();
                    break;
                case "state":
                    serverStateRef.current = data.data;
                    errorMessageRef.current = "";
                    forceUpdate();
                    break;
                case "response":
                    if (data.data) {
                        // If answered correctly
                        // TODO correct effects
                    }
                    else {
                        // If answered incorrectly or error
                        // warn(data.error!);
                    }
                    break;
                case "error":
                    errorMessageRef.current = data.data;
                    forceUpdate();
                    break;
                }
                if (devMode)
                    console.log("Received", data);
			};
			ws.onopen = () => {
				setInitialized(true);
			};
			ws.onclose = () => {
				console.log("Closed");
                errorMessageRef.current = "Connection closed";
                if (devMode)
                    reset();
                else
                    setDisconnected(true);
			};
		})();
        
        return () => {
            shouldClear = true;
            wsRef.current?.close();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const doLog = () => {
        console.log(playerData, gameData);
    };

    return (
        <div>
            <h1>Monkey Sense</h1>
            {
                !initialized ? <Initializing /> : 
                !inGame ? <EnteringGame usernameRef={usernameRef} onJoinGame={onJoinGame} errorMessageRef={errorMessageRef} loading={loading} /> :
                    <div>
                        <DuelTimer startTime={startTimeRef.current} timer={gameData.timer} text="Time:" showTime={serverState !== ServerState.CANNOT_START} />
                        <br/>
                        <MathJaxContext config={MathJaxConfig}>
                            <MathJax id="question" className="mb-4" dynamic>{
                                serverState === ServerState.IN_PROGRESS
                                    ? gameData.question
                                    : serverState === ServerState.WAITING_NEXT
                                        ? "Answer: " + gameData.question
                                        : statusTexts[serverState]
                            }</MathJax>
                        </MathJaxContext>
                        <div className="flex-center my-2">
                            <TextBox className={isCorrect ? "bg-green-100 hover:bg-green-100" : isWrong ? "bg-red-100 hover:bg-red-100" : ""} valueRef={textBoxRef} onEnter={onEnterPressed} endContent={textboxEndContent} />
                        </div>
                        { errorMessageRef.current && <div className="text-red-500">{errorMessageRef.current}</div> }
                        { serverState === ServerState.IN_PROGRESS && !isCorrect && <div>{myPlayerData ? myPlayerData.tries : "?"} {myPlayerData?.tries !== 1 ? "tries" : "try"}</div> }
                        { devMode && <div>Game Data: {JSON.stringify(gameData)}</div> }
                        <br/>
                        <Players usernameRef={usernameRef} playerData={playerData} />
                    </div>
            }
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