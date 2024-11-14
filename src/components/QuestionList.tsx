import QuestionInfo from "./QuestionInfo";
import { useEffect, useRef, useState } from "react";
import { QuestionGeneratorList } from "@/util/generator";
import Button from "./Button";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { Question } from "@/util/types";

interface QuestionListProps {
    questionGen: QuestionGeneratorList;
    startPractice: (question: string) => void;
}

export default function QuestionList({ questionGen, startPractice }: QuestionListProps) {
    const gens = questionGen.questionGens;
    const sortedGens = Object.keys(gens).sort((a, b) => (gens[a].tier - gens[b].tier) * 100 - (gens[a].weight - gens[b].weight));
    
    const [question, setQuestion] = useState<Question | null>(null);
    const [active, setActive] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);

    const open = () => setActive(!active);
    const practice = () => {
        if (selected) {
            startPractice(selected);
        }
    }
    const regenerate = () => {
        if (selected) {
            setQuestion(gens[selected].func());
        }
    }

    useEffect(() => {
        if (selected)
            setQuestion(gens[selected].func());
    }, [selected]);

    return (
        <>
            <Button className="!p-2 w-fit align-middle" onClick={open}>
                Question Types
                <svg className="ml-2 float-right" width={20} height={20} viewBox="0 0 100 100" fill="#0000" stroke="#000" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">
                    {
                        active ? <path d="M 5 75 L 50 25 L 95 75" /> : <path d="M 5 25 L 50 75 L 95 25" />
                    }
                </svg>
            </Button>
            <div className="h-3" />
            <div className={`rounded-md m-auto w-[80%] max-w-[800px] grid justify-center transition-all duration-300 border-2 border-black border-solid grid-cols-[1fr]
                ${active ? "p-8 grid-rows-[1fr] border-opacity-100 bg-zinc-700" : "grid-rows-[0fr] border-opacity-0"}`}>
                    <div className="overflow-hidden w-full">
                        <div className="flex flex-row justify-between items-start w-full">
                            <div className="flex flex-col justify-start items-start overflow-y-scroll max-h-[600px] bg-zinc-600 rounded-md border-2 border-black border-solid p-0 overflow-x-clip">
                                {sortedGens.map((q, i) => <QuestionInfo key={i} id={q} question={gens[q]} selected={selected} update={setSelected} />)}
                            </div>
                            <div className="w-full">
                                {selected &&
                                    <div>
                                        <div className="text-3xl">{gens[selected].name}</div>
                                        <br />
                                        Weight: {gens[selected].weight}
                                        <br />
                                        Tier: {gens[selected].tier + 1}
                                        <div className="h-4" />
                                        <Button onClick={practice}>Practice</Button>
                                        <div className="h-12" />
                                        <div className="bg-zinc-500 w-fit m-auto p-4 rounded-md border-2 border-black border-solid">
                                            <div className="text-2xl">Sample Problem:</div>
                                            <br />
                                            {question &&
                                                <MathJaxContext>
                                                    <MathJax>
                                                        {question.str}
                                                    </MathJax>
                                                    <br />
                                                    <MathJax>
                                                        {question.ansArr ? `\`${question.ansArr}\`` : question.ansStr ? `\`${question.ansStr}\`` : `\`${question.ans}\``}
                                                    </MathJax>
                                                </MathJaxContext>
                                            }
                                            <br />
                                            <Button onClick={regenerate}>New Problem</Button>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
            </div>
        </>
    );
    
}