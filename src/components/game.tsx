"use client"

import { getAnswerDisplay, judgeQuestion, QuestionGeneratorList, RNG } from "@/util/generator";
import { AnsweredQuestion, defaultQuestion, defaultTestLength, EnterMode, enterModes, GameMode, gameModeMappings, gameModes, MathJaxConfig, Message, MessageExtra, Question, TestLength, testLengths, timePerQuestion, ViewableLeadeboardEntry } from "@/util/types";
import { useEffect, useRef, useState } from "react";
import TextBox from "./common/textbox";
import Timer from "./common/timer";
import { useRouter } from "next/navigation"
import Leaderboard from "./leaderboard/Leaderboard";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import QuestionList from "./questions/QuestionList";
import Button from "./common/Button";
import { QuestionInfoDropdown } from "./questions/QuestionInfoDropdown";
import { useUIMode } from "./UIModeProvider";

export const getTimeColorBounds = (gameMode: string) => {
    if (gameMode === "Zetamac")
        return { blueEnd: 800, green: 1200, yellow: 2000, redEnd: 3000 };
    return { blueEnd: 3000, green: 5000, yellow: 7500, redEnd: 15000 };
}
/**
 * Returns a CSS color string based on how good the answer time is
 */
export const getTimeColor = (ms: number, gameMode: string = "Number Sense") => {
    const { blueEnd, green, yellow, redEnd } = getTimeColorBounds(gameMode);
    const r = Math.max(0, Math.min(1, (ms - green) / (yellow - green))) * 0xff;
    const g = Math.max(0, Math.min(1, 1 - (ms - yellow) / (redEnd - yellow))) * 0xff;
    const b = Math.max(0, Math.min(1, 1 - (ms - blueEnd) / (green - blueEnd))) * 0xff;
    return `rgb(${r}, ${g}, ${b})`;
}

export const getAccuracyColor = (accuracy: number) => {
    const blueEnd = .95, green = .9, yellow = .8, redEnd = .7;
    const r = Math.max(0, Math.min(1, (green - accuracy) / (green - yellow))) * 0xff;
    const g = Math.max(0, Math.min(1, 1 - (yellow - accuracy) / (yellow - redEnd))) * 0xff;
    const b = Math.max(0, Math.min(1, 1 - (blueEnd - accuracy) / (blueEnd - green))) * 0xff;
    return `rgb(${r}, ${g}, ${b})`;
}

interface GameProps {
    isSignedIn: boolean;
};

export default function Game({ isSignedIn }: GameProps) {
    const router = useRouter();
    const { mode: uiMode } = useUIMode();
    const [lastT, setLastT] = useState(0);
    const [total, setTotal] = useState(0);
    const [testLength, setTestLength] = useState<TestLength>(defaultTestLength);
    const [question, setQuestion] = useState<Question>(defaultQuestion);
    const [enterMode, setEnterMode] = useState<EnterMode>("Default");
    const [gameMode, setGameMode] = useState<GameMode>("Number Sense");
    const [questionCount, setQuestionCount] = useState(0);
    const [startT, setStartT] = useState(0);
    const [active, setActive] = useState(false);
    const [startingTest, setStartingTest] = useState(false);
    
    const [answerTime, setAnswerTime] = useState(0);
    const [lastAnswer, setLastAnswer] = useState("");
    const [scoreStr, setScoreStr] = useState("");
    const [accuracy, setAccuracy] = useState(-1);
    const [leaderboardEntries, setLeaderboardEntries] = useState<{[key: GameMode]: ViewableLeadeboardEntry[][]}>({});
    
    const questionGenRef = useRef<QuestionGeneratorList>(new QuestionGeneratorList(new RNG()));
    const questionGen = questionGenRef.current;
    const filterKeysRef = useRef<string[]>([]);
    const textBoxRef = useRef<string>("");
    const textBoxElementRef = useRef<HTMLInputElement | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const answeredQuestions = useRef<AnsweredQuestion[]>([]);
    const currentCategoryRef = useRef<string>("");
    const currentIncorrectRef = useRef<boolean>(false);
    const timeRef = useRef(0);

    const isInGame = () => {
        return active;
    };
    
    const getQuestionText = () => {
        return `Q${total + 1}: ${question.str}`;
    }

    const displayQuestion = () => {
        textBoxRef.current = "";
        currentIncorrectRef.current = false;
    };
    
    const advanceQuestion = () => {
        const arr: Message[] = [];
        setTotal(total + 1);
        setLastT(Date.now());
        const modeQuestion = questionGen.generateQuestion({ lastT, total, testLength, question, enterMode, gameMode }, filterKeysRef.current);
        currentCategoryRef.current = modeQuestion.category;
        setQuestion(modeQuestion.question);
        displayQuestion();
        // Todo remove
        return arr;
    }

    const onCorrectAnswer = (extra: MessageExtra, str: string = "") => {
        // On correct answer
        answeredQuestions.current.push({ category: currentCategoryRef.current, incorrect: currentIncorrectRef.current, time: extra.time, question:                        extra.question, response: extra.response });
        currentIncorrectRef.current = false;
        if (enterMode !== "Test")
            setLastAnswer(str);
    }
    
    const onWrongAnswer = (extra: MessageExtra) => {
        if (enterMode === "Test") {
            // Only called in test mode
            // only time .time is used in "wrong" message
            answeredQuestions.current.push({ category: currentCategoryRef.current, incorrect: true, time: extra.time, question: extra.question, response: extra.response });
            advanceQuestion();
            setQuestionCount(questionCount + 1);
            checkForTestEnd();
        }
        else {
            if (shouldRequireEnter())
                currentIncorrectRef.current = true;
            if (enterMode === "Hardcore") {
                answeredQuestions.current.push({ category: currentCategoryRef.current, incorrect: true, time: extra.time, question: extra.question, response: extra.response });
                doStop();
            }
        }
    };
    
    const modeHandler = (str: string) => {
        if (!isInGame())
            return;
        
        const t = Date.now() - lastT;
        const extra = { time: t, question: question, response: str };
        const judgement = judgeQuestion(question, str);
        if (!judgement.correct) {
            onWrongAnswer(extra);
            return;
        }
        onCorrectAnswer(extra, judgement.other);

        // Update answer time, check for test end
        setAnswerTime(t);
        setQuestionCount(questionCount + 1);
        if (checkForTestEnd())
            return;
        advanceQuestion();
    };

    // NEW STUFF    

    const shouldRequireEnter = () => {
        return ["Default", "Hardcore", "TestMode"].includes(enterMode);
    }

    const time = timeRef.current;

    const checkForTestEnd = () => {
        // Test is its own page now
        // if (enterMode !== "Test" && gameMode !== "Zetamac" && questionCount >= testLength) {
        //     doStop();
        //     return true;
        // }
        return false;
    }

    const startMode = () => {
        // Switch to /test if in test mode
        if (enterMode === "Test") {
            setActive(false);
            setStartingTest(true);
            router.push(`/test?mode=${gameModeMappings[gameMode]}&testLength=${testLength}`);
            // fetch(`/test/new?mode=${gameModeMappings[gameMode]}&testLength=${testLength}`).then(res => res.json()).then(data => {
            //     sessionStorage.setItem("TestData", JSON.stringify(Object.assign(data, {gameMode: gameMode, testLength: testLength})));
            //     router.push("/test");
            // });
            return;
        }

        // const keyStr = text.includes(" ")
        //   ? text.substring(text.indexOf(" ") + 1).trim()
        //   : "";
        const keyStr = textBoxRef.current.trim();

        // Handle print
        if (enterMode === "Print") {
            setActive(false);
            router.push(`/print?${keyStr == "" ? "" : `seed=${keyStr}&`}`)
            return;
        }
        // Handle duel
        if (enterMode === "Duel") {
            setActive(false);
            router.push(`/duel`)
            return;
        }

        if (keyStr.length == 0) {
            filterKeysRef.current = Object.keys(questionGen.questionGens);
        }
        else
            filterKeysRef.current = keyStr.split(" ").filter(key => questionGen.questionGens[key]);
        if (filterKeysRef.current.length === 0)
            filterKeysRef.current = Object.keys(questionGen.questionGens);
        setTotal(0);
        setLastT(Date.now());
        const modeQuestion = questionGen.generateQuestion({ lastT, total, testLength, question, enterMode, gameMode }, filterKeysRef.current);
        currentCategoryRef.current = modeQuestion.category;
        setQuestion(modeQuestion.question);
        displayQuestion();
        
        textBoxRef.current = "";
        textBoxElementRef.current?.focus();
        setQuestionCount(0);
        setStartT(Date.now());
        setAnswerTime(0);
        setLastAnswer("");
        setScoreStr("");
        setAccuracy(-1);
    }

    const doTimeUpdate = () => {
        const t = Date.now() - startT;
        if (enterMode === "Test" && t > (gameMode === "Zetamac" ? testLength * 1000 : timePerQuestion * testLength)) {
            doStop();
        }
        return t;
    }

    const doStart = () => {
        if (isInGame())
            return;
        setActive(true);
        startMode();
        answeredQuestions.current.splice(0, answeredQuestions.current.length);
    }

    const doStop = () => {
        if (!isInGame())
            return;
        setActive(false);
        textBoxRef.current = "";
        // Display answered questions
        console.log("-----Results-----");
        const byCategory: {[key: string]: {correct: number, total: number, totalTime: number}} = {};
        for (const question of answeredQuestions.current) {
            if (!byCategory[question.category])
                byCategory[question.category] = { correct: 0, total: 0, totalTime: 0 };
            if (!question.incorrect)
                byCategory[question.category].correct++;
            else if (shouldRequireEnter())
                console.log("[%s] %s (you put %s, ans = %s)", question.category, question.question.str, question.response, getAnswerDisplay(question.question));
            byCategory[question.category].total++;
            byCategory[question.category].totalTime += question.time;
        }
        let correct = 0, total = 0, totalTime = 0;
        for (const category in byCategory) {
            const data = byCategory[category];
            correct += data.correct;
            total += data.total;
            totalTime += data.totalTime;
            const avgTime = data.totalTime / data.total;
            console.log(`${category}: ${data.correct}/${data.total} correct, average time: ${Math.round(avgTime)}ms`);
            if (avgTime > 7500)
                console.log("Average time is too high!");
            if (data.correct / data.total < 0.8)
                console.log("Accuracy is too low!");
        }
        const score = total * 5 - (total - correct) * 9;
        if (total > 0) {
            if (enterMode === "Test") {
                if (gameMode === "Zetamac")
                    setScoreStr(`${correct} (${correct * 120 / testLength} adj.)`);
                else
                    setScoreStr(`${score} (${score * 80 / testLength} adj.)`);
            }
            else
                setScoreStr(`${score} (${Math.round(score * 80 / total)} adj.)`);
        }
        const acc = (correct / Math.max(total, 1) * 100);
        setAccuracy(acc);
        console.log(`Total: ${correct}/${total} correct, Accuracy: ${Math.round(acc)}%`);
        console.log(`Total time: ${Math.round(totalTime)}ms, Average time: ${Math.round(totalTime / total)}ms`);
        console.log(`Score: ${score} (${score * 80 / total} adj.)`);
        console.log("-----End-----");
    }
    
    const doStartStop = () => {
        if (isInGame())
            doStop();
        else
            doStart();
    };

    const startPractice = (question: string) => {
        if (isInGame())
            doStop();
        textBoxRef.current = question;
        doStart();
    }

    function onInputChange() {
        if (!shouldRequireEnter())
            modeHandler(textBoxRef.current);
    }

    function onEnterPressed() {
        modeHandler(textBoxRef.current);
    }

    useEffect(() => {
        fetch(`/leaderboard?mode=all`).then(res => res.json()).then(setLeaderboardEntries);
    }, []);

    if (startingTest) {
        return (
            <div className="text-2xl">Starting Test...</div>
        );
    }

    return (
        <div className="game-view max-w-4xl mx-auto px-4 pb-12">
            <div className="game-intro px-2 py-4 mb-4">
                <div className="modern-ui-only text-base text-gray-300 mb-2">{gameMode} / {active ? "In progress" : "Practice"}</div>
                <MathJaxContext config={MathJaxConfig}>
                    <MathJax id="question" className="overflow-x-auto py-3" dynamic>{isInGame() ? getQuestionText() : uiMode === "old" ? "Click start" : "Ready when you are."}</MathJax>
                </MathJaxContext>
                
                <div className="flex-center my-4">
                    <TextBox ref={textBoxElementRef} valueRef={textBoxRef} placeholder={uiMode === "old" ? undefined : active ? "Your answer" : "Optional question keys"} onChange={onInputChange} onEnter={onEnterPressed} />
                </div>
                <div className="flex-center my-4">
                    <Button className="px-8" onClick={doStartStop}>{active ? "Stop" : "Start"}</Button>
                </div>
                <div className="modern-ui-only text-sm text-gray-300">{active ? (shouldRequireEnter() ? "Press Enter to submit your answer." : "Correct answers advance automatically.") : "Choose your mode below, then start a session."}</div>
            </div>

            {!active &&
                <>
                    <div className="game-settings grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 max-w-sm mx-auto my-6">
                        <label htmlFor="mode" className="mr-2">Mode</label>
                        <select id="mode" name="mode" className="field-control" value={gameMode} onChange={(e) => setGameMode(e.target.value)}>
                            { gameModes.map((mode) => <option key={mode} value={mode}>{mode}</option>) }
                        </select>
                        <label htmlFor="entermode" className="mr-2">Behavior</label>
                        <select id="entermode" name="entermode" className="field-control" value={enterMode} onChange={(e) => setEnterMode(e.target.value)}>
                            { enterModes.map((mode) => <option key={mode} value={mode}>{mode}</option>) }
                        </select>

                        { enterMode === "Test" && (
                            <>
                                <label htmlFor="testmode" className="mr-2">Test Length</label>
                                <select id="testmode" className="field-control" value={testLength} onChange={(e) => setTestLength(parseInt(e.target.value))}>
                                    { testLengths.map((length) => <option key={length} value={length}>{length}</option>) }
                                </select>
                                { !isSignedIn &&
                                    <div className="col-span-2 text-sm my-1 text-amber-300">Sign in to save your score</div>
                                }
                            </>
                        )}
                    </div>

                    <div className="session-stats surface-panel max-w-md mx-auto p-5 mb-6 space-y-2 tabular-nums" style={{display: scoreStr !== "" ? "block" : "none"}}>
                        <div className="text-lg font-semibold mb-3">Session Stats</div>
                        <div className="flex-center">
                            <div>Question Count:</div>
                            <div>{questionCount}</div>
                        </div>
                        <div className="flex-center">
                            <div>Accuracy:</div>
                            <div style={{color: getAccuracyColor(Math.max(0, accuracy / 100))}}>{questionCount > 0 && accuracy !== -1 ? accuracy.toFixed(1) + "%" : ""}</div>
                        </div>
                        <div className="flex-center">
                            <div>Score:</div>
                            <div>{scoreStr}</div>
                        </div>
                        <div className="flex-center">
                            <div>Average Time:</div>
                            <div style={{color: questionCount > 0 && enterMode !== "Test" ? getTimeColor(time / questionCount, gameMode) : ""}}>
                                {questionCount > 0 && enterMode !== "Test" ? `${Math.round(time / questionCount)}ms` : ""}
                            </div>
                        </div>
                        <div className="flex-center">
                            <div>Total Time:</div>
                            <Timer startingTime={timeRef.current} timeRef={timeRef} intervalRef={intervalRef} shouldMakeInterval={false} doTimeUpdate={doTimeUpdate} />
                        </div>
                    </div>
                    <QuestionList questionGens={questionGen} startPractice={startPractice} />
                </>
            }

            {active &&
                <>
                    <div className="flex-center">
                        <div>Last Time:</div>
                        <div style={{color: questionCount > 0 && enterMode !== "Test" ? getTimeColor(answerTime, gameMode) : ""}}>
                            {questionCount > 0 && enterMode !== "Test" ? `${Math.round(answerTime)}ms` : ""}
                        </div>
                    </div>
                    <div>{lastAnswer}</div>
                    <div>
                        <div className="flex-center">
                            <div>Question Count:</div>
                            <div>{questionCount}</div>
                        </div>
                        <div className="flex-center">
                            <div>Average Time:</div>
                            <div style={{color: questionCount > 0 && enterMode !== "Test" ? getTimeColor(time / questionCount, gameMode) : ""}}>
                                {questionCount > 0 && enterMode !== "Test" ? `${Math.round(time / questionCount)}ms` : ""}
                            </div>
                        </div>
                        <div className="flex-center">
                            <div>Total Time:</div>
                            <Timer timeRef={timeRef} intervalRef={intervalRef} shouldMakeInterval={active} doTimeUpdate={doTimeUpdate} />
                        </div>
                    </div>
                    <div className="h-4" />
                    <QuestionInfoDropdown questionGens={questionGen} selected={currentCategoryRef.current} startPractice={startPractice} />
                </>
            }

            <br/>
            <div className={active ? "hidden" : ""}>
                <Leaderboard leaderboardEntries={leaderboardEntries} gameMode={gameMode} testLength={testLength} setTestLength={setTestLength} />
            </div>
        </div>
    );
}