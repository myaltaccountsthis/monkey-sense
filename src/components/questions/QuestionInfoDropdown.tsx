import { QuestionGeneratorList } from "@/util/generator";
import Button from "../common/Button"
import QuestionInfo from "./QuestionInfo"
import { useState } from "react";
import { useUIMode } from "../UIModeProvider";

interface QuestionInfoDropdownProps {
    questionGens: QuestionGeneratorList;
    selected: string;
    startPractice: (question: string) => void;
}

export function QuestionInfoDropdown({ questionGens, selected, startPractice }: QuestionInfoDropdownProps) {
    const { mode } = useUIMode();
    const [active, setActive] = useState(false);
    const arrow = active ? <path d="M 5 75 L 50 25 L 95 75" /> : <path d="M 5 25 L 50 75 L 95 25" />;

    const practice = () => {
        if (selected) {
            startPractice(selected);
        }
    }
    const open = () => setActive(!active);

    if (mode === "old") {
        return (<>
            <Button classic className="!p-2 w-fit align-middle" onClick={open}>
                Hint/Info/Cheat
                <svg className="ml-2 float-right" width={20} height={20} viewBox="0 0 100 100" fill="#0000" stroke="#000" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">
                    {arrow}
                </svg>
            </Button>
            <div className="h-3" />
            <div className={`rounded-md m-auto w-[80%] max-w-[800px] grid justify-center transition-all duration-300 border-2 border-black border-solid grid-cols-[1fr]
                ${active ? "p-8 grid-rows-[1fr] border-opacity-100 bg-zinc-700" : "grid-rows-[0fr] border-opacity-0"}`}>
                <div className="overflow-hidden w-full">
                    <QuestionInfo key={selected} questionGens={questionGens} selected={selected} practice={practice} />
                </div>
            </div>
        </>)
    }

    return (<>
        <Button className="inline-flex items-center gap-2" onClick={open} aria-expanded={active} aria-controls="question-info">
            Hints &amp; Info
            <svg aria-hidden="true" width={14} height={14} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">
                {arrow}
            </svg>
        </Button>
        <div id="question-info" hidden={!active} className="surface-panel max-w-2xl mx-auto mt-4 p-4 sm:p-6">
            {active && <QuestionInfo key={selected} questionGens={questionGens} selected={selected} practice={practice} />}
        </div>
    </>)
}