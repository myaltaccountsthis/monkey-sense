"use client"

import { QuestionGeneratorList, RNG } from "@/util/generator";
import { AnsweredQuestion, defaultQuestion, EnterMode, enterModes, GameMode, gameModes, MathJax, Message, MessageExtra, ModeData, Question, TestLength, testLengths } from "@/util/types";
import { useEffect, useRef, useState } from "react";
import TextBox from "./textbox";
import Timer from "./timer";
import { actionAsyncStorage } from "next/dist/client/components/action-async-storage-instance";

interface GameProps {

}

const timePerQuestion = 7500;

export default function Game({}: GameProps) {
    const [lastT, setLastT] = useState(0);
    const [total, setTotal] = useState(0);
    const [testLength, setTestLength] = useState<TestLength>(80);
    const [question, setQuestion] = useState<Question>(defaultQuestion);
    const [enterMode, setEnterMode] = useState<EnterMode>("Default");
    const [gameMode, setGameMode] = useState<GameMode>("Number Sense");
    const [questionCount, setQuestionCount] = useState(0);
    const [startT, setStartT] = useState(0);
    const [active, setActive] = useState(false);

    const [answerTime, setAnswerTime] = useState(0);
    const [lastAnswer, setLastAnswer] = useState("");
    const [scoreStr, setScoreStr] = useState("");
    const [accuracy, setAccuracy] = useState(-1);
    const [questionStr, setQuestionStr] = useState("");
    
    const questionGenRef = useRef<QuestionGeneratorList>(new QuestionGeneratorList(new RNG()));
    const questionGen = questionGenRef.current;
    const filterKeysRef = useRef<string[]>([]);
    const textBoxRef = useRef<string>("");
    const textBoxElementRef = useRef<HTMLInputElement | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const answeredQuestions = useRef<AnsweredQuestion[]>([]);
    const currentCategoryRef = useRef<string>("");
    const currentIncorrectRef = useRef<boolean>(false);
    const prevAnswerTimeRef = useRef(0);

    const isInGame = () => {
        return active;
    };
    
    const getQuestionText = () => {
        return `Q${total + 1}: ${question.str}`;
    }

    const displayQuestion = () => {
        textBoxRef.current = "";
        currentIncorrectRef.current = false;
        setTimeout(() => MathJax.typeset(), 1);
    };
    
    const advanceQuestion = () => {
        const arr: Message[] = [];
        setTotal(total + 1);
        setLastT(Date.now());
        currentCategoryRef.current = questionGen.generateQuestion({ lastT, total, testLength, question, enterMode, gameMode }, filterKeysRef.current);
        // Todo remove
        return arr;
    }

    const onCorrectAnswer = (extra: MessageExtra, str: string = "") => {
        // On correct answer
        answeredQuestions.current.push({ category: currentCategoryRef.current, incorrect: currentIncorrectRef.current, time: extra.time, question:                        extra.question, response: extra.response });
        currentIncorrectRef.current = false;
        if (gameMode !== "Test")
            setLastAnswer(str);
    }
    
    const onWrongAnswer = (extra: MessageExtra) => {
        if (gameMode === "Test") {
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
    
    /*
    Types of messages:
    Reply {
        data, extra
    }
    
    Status {
        tag = ["answer", "wrong", "answertime", "start", "stop", "questionCategory"]
        data
    }

    Question {
        data
    }

    */
    const modeHandler = (str: string) => {
        const n = parseFloat(str);
        if (!isInGame())
            return;
        
        const t = Date.now() - lastT;
        const extra = { time: t, question: question, response: str };
        // If non-numeric answer
        if (question.ansStr || question.ansArr) {
            // If correct
            if (question.ansArr?.includes(str) || str === question.ansStr) {
                onCorrectAnswer(extra);
            }
            else {
                onWrongAnswer(extra);
                return;
            }
        }
        else if (!isNaN(n)) {
            // Check guess bounds
            if (question.guess && Math.abs((n - question.ans) / question.ans) < 0.05) {
                const diff = Math.abs((n - question.ans) / question.ans);
                const prefix =  diff < 0.01 ?   "🟦 Excellent guess!" :
                                diff < 0.03 ?   "🟩 Great guess!" :
                                                "🟨 Good guess!";
                onCorrectAnswer(extra, `${prefix} ${(diff * 100).toFixed(1)}% off. ${Math.round(question.ans - .05 * question.ans)}-${Math.round(question.ans + .05 * question.ans)}`);
            }
            else if (n === question.ans) {
                onCorrectAnswer(extra);
            }
            else {
                onWrongAnswer(extra);
                return;
            }
        }
        else
            return;
        // Update answer time, check for test end
        prevAnswerTimeRef.current = t;
        setQuestionCount(questionCount + 1);
        if (checkForTestEnd())
            return;
        advanceQuestion();
    };

    // NEW STUFF

    const getTimeColorBounds = () => {
        if (gameMode === "zetamac")
            return { blueEnd: 800, green: 1200, yellow: 2000, redEnd: 3000 };
        return { blueEnd: 3000, green: 5000, yellow: 7500, redEnd: 15000 };
    }
    /**
     * Returns a CSS color string based on how good the answer time is
     */
    const getTimeColor = (ms: number) => {
        const { blueEnd, green, yellow, redEnd } = getTimeColorBounds();
        const r = Math.max(0, Math.min(1, (ms - green) / (yellow - green))) * 0xff;
        const g = Math.max(0, Math.min(1, 1 - (ms - yellow) / (redEnd - yellow))) * 0xff;
        const b = Math.max(0, Math.min(1, 1 - (ms - blueEnd) / (green - blueEnd))) * 0xff;
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    const getAccuracyColor = (accuracy: number) => {
        const blueEnd = .95, green = .9, yellow = .8, redEnd = .7;
        const r = Math.max(0, Math.min(1, (green - accuracy) / (green - yellow))) * 0xff;
        const g = Math.max(0, Math.min(1, 1 - (yellow - accuracy) / (yellow - redEnd))) * 0xff;
        const b = Math.max(0, Math.min(1, 1 - (blueEnd - accuracy) / (blueEnd - green))) * 0xff;
        return `rgb(${r}, ${g}, ${b})`;
    }

    const shouldRequireEnter = () => {
        return ["Default", "Hardcore", "TestMode"].includes(enterMode);
    }

    const time = (Date.now() - startT);

    const checkForTestEnd = () => {
        if (gameMode !== "Test" && gameMode !== "Zetamac" && questionCount >= testLength) {
            doStop();
            return true;
        }
        return false;
    }

    const startMode = () => {
        // const keyStr = text.includes(" ")
        //   ? text.substring(text.indexOf(" ") + 1).trim()
        //   : "";
        const keyStr = textBoxRef.current.trim();
        if (keyStr.length == 0) {
            filterKeysRef.current = Object.keys(questionGen.questionGens);
        }
        else
            filterKeysRef.current = keyStr.split(" ").filter(key => questionGen.questionGens[key]);
        if (filterKeysRef.current.length === 0)
            filterKeysRef.current = Object.keys(questionGen.questionGens);
        setTotal(0);
        setLastT(Date.now());
        const category = questionGen.generateQuestion({ lastT, total, testLength, question, enterMode, gameMode }, filterKeysRef.current);
        currentCategoryRef.current = category;
        
        textBoxRef.current = "";
        textBoxElementRef.current?.focus();
        setQuestionCount(0);
        setStartT(Date.now());
        setAnswerTime(0);
        setLastAnswer("");
        setScoreStr("");
        setAccuracy(-1);
        
        intervalRef.current = setInterval(() => {
        }, 100);
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
                console.log("[%s] %s (you put %s, ans = %s)", question.category, question.question.str, question.response, question.question.ans);
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
        if (total > 0 && enterMode != "Test") {
            
            if (gameMode === "zetamac")
                setScoreStr(`${correct} (${correct * 120 / testLength} adj.)`);
            else
                setScoreStr(`${score} (${score * 80 / testLength} adj.)`);
        }
        setAccuracy((correct / total * 100));
        console.log(`Total: ${correct}/${total} correct, Accuracy: ${Math.round(correct / total * 100)}%`);
        console.log(`Total time: ${Math.round(totalTime)}ms, Average time: ${Math.round(totalTime / total)}ms`);
        console.log(`Score: ${score} (${score * 80 / total} adj.)`);
        console.log("-----End-----");
    }

    function onInputChange() {
        if (!shouldRequireEnter())
            modeHandler(textBoxRef.current);
    }

    function onEnterPressed() {
        modeHandler(textBoxRef.current);
    }

    useEffect(() => {
        // Show all categories at the start
        console.log("Categories:")
        for (const category in questionGen.questionGens) {
            console.log(category);
        }
    }, [])

    return (
        <div>
            <div id="question">{isInGame() ? question.str : "Click Start"}</div>
            <div className="flex-center">
                <TextBox ref={textBoxElementRef} valueRef={textBoxRef} onChange={onInputChange} onEnter={onEnterPressed} />
            </div>
            <br />
            <div className="mb-2">
                <label htmlFor="mode">Mode&nbsp;</label>
                <select name="mode" id="mode" tabIndex={-1}>
                    { gameModes.map((mode) => <option value={mode} selected={mode === gameMode}>{mode}</option>) }
                </select>
                
                <label htmlFor="entermode"></label>
                <select>
                    { enterModes.map((mode) => <option value={mode} selected={mode === enterMode}>{mode}</option>) }
                </select>

                {
                    gameMode === "Test" && intervalRef.current == null && (
                        <div className="flex flex-row justify-center items-center gap-1">
                            <label htmlFor="testmode">Test Mode</label>
                            <select name="testlength" id="testlength" tabIndex={-1}>
                                { testLengths.map((length) => <option value={length} selected={length === testLength} onSelect={e => setTestLength(parseInt(e.currentTarget.value))}>{length}</option>) }
                            </select>
                        </div>
                    )
                }
                
            </div>
            <div className="flex-center">
                <button id="start" onClick={doStart}>Start</button>
                <div></div>
                <button id="stop" onClick={doStop}>Stop</button>
            </div>
            <br />
            <div>
                <div className="flex-center">
                    <div>Last Time:</div>
                    <div id="answertime" style={{color: questionCount > 0 && gameMode !== "Test" ? getTimeColor(prevAnswerTimeRef.current) : ""}}>
                        {questionCount > 0 && gameMode !== "Test" ? `${Math.round(prevAnswerTimeRef.current)}ms` : ""}
                    </div>
                </div>
                <div id="lastanswer">{lastAnswer}</div>
                <div id="data">
                    <div className="flex-center">
                        <div>Question Count:</div>
                        <div id="questioncount">{questionCount}</div>
                    </div>
                    <div className="flex-center">
                        <div>Average Time:</div>
                        <div id="averagetime" style={{color: questionCount > 0 && gameMode !== "Test" ? getTimeColor(time / questionCount) : ""}}>
                            {questionCount > 0 && gameMode !== "Test" ? `${Math.round(time / questionCount)}ms` : ""}
                        </div>
                    </div>
                    <div className="flex-center">
                        <div>Accuracy:</div>
                        <div id="accuracy" style={{color: getAccuracyColor(accuracy >= 0 ? accuracy : 100)}}>{accuracy.toFixed(1) + "%"}</div>
                    </div>
                    <div className="flex-center">
                        <div>Score:</div>
                        <div id="score">{scoreStr}</div>
                    </div>
                    <div className="flex-center">
                        <div>Total Time:</div>
                        <Timer intervalRef={intervalRef} shouldMakeInterval={active} doTimeUpdate={doTimeUpdate} />
                    </div>
                </div>
            </div>
        </div>
    );
}