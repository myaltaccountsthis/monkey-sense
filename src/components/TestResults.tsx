"use client"

import { getAnswerDisplay } from "@/util/generator";
import { MathJaxConfig, TestResults } from "@/util/types";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import React from "react";

export default function MathJaxClient({ testResults }: { testResults: TestResults }) {
    return (
        <MathJaxContext config={MathJaxConfig}>
            {
                testResults.questions.map((question, i) =>
                    <div className="my-2" key={i}>
                        {`Q${i + 1}`}. <MathJax inline>{question.str}</MathJax> {testResults.judgements[i].correct ? "✔️" : `❌ (you put ${testResults.answers[i]}, ans = ${getAnswerDisplay(question)})`}
                    </div>
                )
            }
        </MathJaxContext>
    );
}