import { use, useEffect, useState } from "react";
import { Question, QuestionGenerator } from "../../backend/src/util/types";
import { QuestionGeneratorList } from "../../backend/src/util/generator";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import Button from "./Button";

interface QuestionInfoProps {
    questionGens: QuestionGeneratorList;
    selected: string;
    practice: () => void;
}

export default function QuestionInfo({ questionGens, selected, practice }: QuestionInfoProps) {
    const questionGen = questionGens.questionGens[selected];
    const [question, setQuestion] = useState<Question>(questionGen.func());

    const regenerate = () => {
        setQuestion(questionGen.func());
    }

    useEffect(() => {
        setQuestion(questionGen.func());
    }, [selected]);

    return (
        <div className="w-full">
            <div className="px-4">
                <h3 className="text-2xl my-2">{questionGen.name}</h3>
                <MathJaxContext>
                    <MathJax>
                        {questionGen.description}
                    </MathJax>
                </MathJaxContext>
                <div className="h-4" />
                Weight: {questionGen.weight}
                <br />
                Tier: {questionGen.tier + 1}
                <div className="h-4" />
                <Button onClick={practice}>Practice</Button>
                <div className="h-12" />
                <div className="bg-zinc-500 w-fit m-auto p-4 rounded-md border-2 border-black border-solid">
                    <div className="text-2xl">Sample Problem:</div>
                    <br />
                    <MathJaxContext>
                        <MathJax>
                            {question.str}
                        </MathJax>
                        <br />
                        <MathJax>
                            {question.ansArr ? `\`${question.ansArr}\`` : question.ansStr ? `\`${question.ansStr}\`` : `\`${Number.isInteger(question.ans) ? question.ans : question.ans.toFixed(3)}\``}
                        </MathJax>
                    </MathJaxContext>
                    <br />
                    <Button onClick={regenerate}>New Problem</Button>
                </div>
            </div>
        </div>
    );
}