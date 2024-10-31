"use client";

import { QuestionGeneratorList, RNG } from "@/util/generator";
import { defaultQuestion, gameModeMappings, gameModes, MathJaxConfig, Question } from "@/util/types";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react";

const getFormattedAnswer = (q: Question) => {
    if (q.ansArr)
        return q.ansArr.join(", ");
    if (q.ansStr)
        return q.ansStr;
    if (q.guess)
        return `${Math.round(q.ans * 0.95)} — ${Math.round(q.ans * 1.05)}`;
    const str = q.ans.toString();
    if (str.includes(".") && str.substring(str.indexOf(".")).length > 3)
        return q.ans.toFixed(3) + "...";
    return str;
}

const QUESTIONS_PER_COL = 40;

export default function Print() {
    const params = useSearchParams();
    const mode = params.get("mode") || "ns";
    const seed = params.get("seed");
    const seedRef = useRef<string | null>(seed);
    const [shouldPrint, setShouldPrint] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);

    if (shouldPrint) {
        setShouldPrint(false);
        setTimeout(() => print(), 1000);
    }

    useEffect(() => {
        if (questions.length === 0) {
            const newQuestions: Question[] = [];
            const questionGen = new QuestionGeneratorList(new RNG(seed || undefined));
            seedRef.current = questionGen.rng.seed;
            for (let offset = 0; offset < 80; offset += QUESTIONS_PER_COL) {
                for (let i = 0; i < QUESTIONS_PER_COL; i++) {
                    const shouldBeEstimate = mode === "estimate" || mode === "ns" && (i + 1) % 10 == 0;
                    let question: Question;
                    do {
                        question = questionGen.generateQuestion({lastT: 0, total: 0, testLength: 80, question: defaultQuestion, enterMode: "", gameMode: gameModes.find(gm => gameModeMappings[gm] === mode)!}, undefined, Math.floor((i + offset) / 20)).question;
                    }
                    while ((question.guess === true) != shouldBeEstimate);
                    if (question.guess)
                        question.str = question.str.replace("*", "");
                    newQuestions.push(question);
                }
            }
            setQuestions(newQuestions);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <MathJaxContext config={MathJaxConfig} onLoad={() => setShouldPrint(true)}>
                <MathJax>
                    <h1 id="title">Monkey Sense {mode === "ns" ? "Number Sense" : mode === "zetamac" ? "Zetamac" : "Estimate"} — {seedRef.current}</h1>
                    <div>
                        { questions.length === 80 &&
                            Array(80 / QUESTIONS_PER_COL).fill(0).map((_, offset) =>
                                <div key={offset} className="page-group">
                                    {
                                        Array(QUESTIONS_PER_COL).fill(0).map((_, i) => {
                                            const question = questions[i + offset * QUESTIONS_PER_COL];
                                            return <div key={i} className="question">{question.guess ? "*" : ""}({i + 1 + offset * QUESTIONS_PER_COL}) <span>&nbsp;</span>{question.str}
                                                <span className="answer-blank">{"_".repeat(12)}</span>
                                            </div>;
                                        })
                                    }
                                </div>
                            )
                        }
                    </div>
                    <h1 className="text-center">Answer Key</h1>
                    <div id="answers">
                        { questions.map((q, i) => <div key={i}>({i + 1}) <span>&nbsp;</span>{getFormattedAnswer(q)}</div>) }
                    </div>
                </MathJax>
            </MathJaxContext>
        </div>
    );
}