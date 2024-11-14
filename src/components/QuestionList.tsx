import QuestionInfo from "./QuestionInfo";
import { useState } from "react";
import { QuestionGeneratorList } from "@/util/generator";
import Button from "./Button";

interface QuestionListProps {
    questionGen: QuestionGeneratorList;
}

export default function QuestionList({ questionGen }: QuestionListProps) {
    const [active, setActive] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const onClick = () => setActive(!active);

    const gens = questionGen.questionGens;
    const sortedGens = Object.keys(gens).sort((a, b) => (gens[a].tier - gens[b].tier) * 100 - (gens[a].weight - gens[b].weight));
    return (
        <>
            <Button className="!p-2 w-fit align-middle" onClick={onClick}>
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
                                        {gens[selected].name}
                                        <br />
                                        Weight: {gens[selected].weight}
                                        <br />
                                        Tier: {gens[selected].tier}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
            </div>
        </>
    );
    
}