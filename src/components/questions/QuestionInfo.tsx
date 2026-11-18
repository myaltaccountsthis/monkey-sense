import { useState } from "react";
import { MathJaxConfig, Question } from "@/util/types";
import { getGuessRange, QuestionGeneratorList } from "@/util/generator";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import Button from "../common/Button";
import { useUIMode } from "../UIModeProvider";

interface QuestionInfoProps {
    questionGens: QuestionGeneratorList;
    selected: string;
    practice: () => void;
}

export default function QuestionInfo({ questionGens, selected, practice }: QuestionInfoProps) {
    const { mode } = useUIMode();
    const questionGen = questionGens.questionGens[selected];
    const [question, setQuestion] = useState<Question>(() => questionGen.func());
    const answer = question.ansArr ? `\`${question.ansArr}\``
        : question.guess ? getGuessRange(question.ans)
        : question.ansStr ? `\`${question.ansStr}\``
        : `\`${Number.isInteger(question.ans) ? question.ans : question.ans.toFixed(3)}\``;

    const regenerate = () => {
        setQuestion(questionGen.func());
    }

    if (mode === "old") {
        return (
            <div className="w-full">
                <div className="px-4">
                    <MathJaxContext config={MathJaxConfig}>
                        <h3 className="text-2xl my-2">{questionGen.name}</h3>
                        <MathJax dynamic>
                            {questionGen.description}
                        </MathJax>
                        <div className="h-4" />
                        Weight: {questionGen.weight}
                        <br />
                        Tier: {questionGen.tier + 1}
                        <div className="h-4" />
                        <Button classic onClick={practice}>Practice</Button>
                        <div className="h-8 md:h-12" />
                        <div className="bg-zinc-500 w-fit m-auto p-4 px-12 rounded-lg border-2 border-black border-solid">
                            <div className="text-2xl">Sample Problem:</div>
                            <br />
                            <MathJax dynamic>
                                {question.str}
                            </MathJax>
                            <br />
                            <MathJax dynamic>
                                {answer}
                            </MathJax>
                            <br />
                            <Button classic onClick={regenerate}>New Problem</Button>
                        </div>
                    </MathJaxContext>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-w-0">
            <MathJaxContext config={MathJaxConfig}>
                <h3 className="text-2xl font-semibold mt-0 mb-3">{questionGen.name}</h3>
                <MathJax className="-mx-2 overflow-x-auto text-zinc-300 leading-relaxed py-2" dynamic>
                    {questionGen.description}
                </MathJax>
                <div className="flex flex-wrap justify-center gap-2 my-4 text-sm text-gray-300">
                    <span className="rounded-md bg-zinc-600 px-3 py-1">Tier {questionGen.tier + 1}</span>
                    <span className="rounded-md bg-zinc-600 px-3 py-1">Weight {questionGen.weight}</span>
                </div>
                <Button onClick={practice}>Practice this type</Button>
                <div className="mt-6 p-4 sm:p-6 rounded-md bg-zinc-600 border border-solid border-black">
                    <div className="text-base font-semibold text-gray-300 mb-4">Sample problem</div>
                    <MathJax className="-mx-2 sm:-mx-4 overflow-x-auto text-xl py-2" dynamic>
                        {question.str}
                    </MathJax>
                    <div className="text-base font-semibold text-gray-300 mt-5 mb-2">Answer</div>
                    <MathJax className="-mx-2 sm:-mx-4 overflow-x-auto text-white py-2" dynamic>
                        {answer}
                    </MathJax>
                    <Button className="mt-4 text-base" onClick={regenerate}>New Problem</Button>
                </div>
            </MathJaxContext>
        </div>
    );
}