import { QuestionGeneratorList } from "../../backend/src/util/generator";
import Button from "./Button"
import QuestionInfo from "./QuestionInfo"
import { useState } from "react";

interface QuestionInfoDropdownProps {
    questionGens: QuestionGeneratorList;
    selected: string;
    startPractice: (question: string) => void;
}

export function QuestionInfoDropdown({ questionGens, selected, startPractice }: QuestionInfoDropdownProps) {
    const [active, setActive] = useState(false);

    const practice = () => {
        if (selected) {
            startPractice(selected);
        }
    }
    const open = () => setActive(!active);

    return (<>
        <Button className="!p-2 w-fit align-middle" onClick={open}>
            Hint/Info/Cheat
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
                <QuestionInfo questionGens={questionGens} selected={selected} practice={practice} />
            </div>
        </div>
    </>)
}