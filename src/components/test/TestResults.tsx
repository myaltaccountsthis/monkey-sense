"use client"

import { getAnswerDisplay } from "@/util/generator";
import { MathJaxConfig, TestResults } from "@/util/types";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import React from "react";

export default function MathJaxClient({ testResults }: { testResults: TestResults }) {
    return (
        <MathJaxContext config={MathJaxConfig}>
            {
                testResults.judgements.map((judgement, i) =>
                    <div className="my-2" key={i}>
                        {`Q${i + 1}`}. <MathJax inline>{testResults.questions[i].str}</MathJax> {testResults.answers[i]} {judgement.correct ? "✔️" : `❌ (ans = ${getAnswerDisplay(testResults.questions[i])})`}
                    </div>
                )
            }
        </MathJaxContext>
    );
}