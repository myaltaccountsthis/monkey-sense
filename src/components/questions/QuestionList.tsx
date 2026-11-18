import QuestionInfo from "./QuestionInfo";
import { FormEvent, useState } from "react";
import { QuestionGeneratorList } from "@/util/generator";
import Button from "../common/Button";
import { twMerge } from "tailwind-merge";
import { useUIMode } from "../UIModeProvider";

interface QuestionListProps {
    questionGens: QuestionGeneratorList;
    startPractice: (question: string) => void;
}

export default function QuestionList({ questionGens, startPractice }: QuestionListProps) {
    const { mode } = useUIMode();
    const gens = questionGens.questionGens;
    const sortedGens = Object.keys(gens).sort((a, b) => (gens[a].tier - gens[b].tier) * 100 - (gens[a].weight - gens[b].weight));
    const [search, setSearch] = useState("");

    const [active, setActive] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);

    const filteredGens = sortedGens.filter(q => gens[q].name.toLowerCase().includes(search.toLowerCase()));
    const arrow = active ? <path d="M 5 75 L 50 25 L 95 75" /> : <path d="M 5 25 L 50 75 L 95 25" />;

    const open = () => setActive(!active);
    const practice = () => {
        if (selected) {
            startPractice(selected);
        }
    }

    const filter = (e: FormEvent<HTMLInputElement>) => {
        setSearch(e.currentTarget.value);
        setSelected(null);
    }

    if (mode === "old") {
        return (
            <>
                <Button classic className="!p-2 w-fit align-middle" onClick={open}>
                    Question Types
                    <svg className="ml-2 float-right" width={20} height={20} viewBox="0 0 100 100" fill="#0000" stroke="#000" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">
                        {arrow}
                    </svg>
                </Button>
                <div className="h-3" />
                <div className={twMerge("rounded-xl m-auto w-[80%] max-w-[800px] grid justify-center transition-all duration-300 border-2 border-black border-solid grid-cols-[1fr]",
                    active ? "p-8 grid-rows-[1fr] border-opacity-100 bg-zinc-700" : "grid-rows-[0fr] border-opacity-0")}>
                    <div className="overflow-hidden w-full">
                        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start w-full">
                            <div className="w-full md:w-1/2 max-w-[300px] md:max-w-48">
                                <input type="text" placeholder="Search" className="w-full box-border p-2 rounded-lg border-2 border-black border-solid text-black" value={search} onChange={filter} />
                                <div className="h-3" />
                                <div className="flex flex-col md:justify-start items-start overflow-y-scroll w-full max-h-[200px] md:max-h-[600px] bg-zinc-600 rounded-lg border-2 border-black border-solid p-0 overflow-x-clip">
                                    {filteredGens.map((q, i) =>
                                        <Button classic key={i} className={twMerge("w-full px-2 bg-zinc-600 active:bg-zinc-400 hover:scale-x-100 rounded-none border-l-0 min-h-20 border-t-0", selected == q ? "!bg-zinc-400" : "hover:bg-zinc-500")} onClick={() => { setSelected(q) }}>
                                            <div className="text-gray-200">{gens[q].name}</div>
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {selected &&
                                <QuestionInfo key={selected} questionGens={questionGens} selected={selected} practice={practice} />
                            }
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Button className="inline-flex items-center gap-2" onClick={open} aria-expanded={active} aria-controls="question-types">
                Question Types
                <svg aria-hidden="true" width={14} height={14} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">
                    {arrow}
                </svg>
            </Button>
            <div id="question-types" hidden={!active} className="surface-panel mt-4 overflow-hidden">
                <div className="grid md:grid-cols-[15rem_minmax(0,1fr)]">
                    <div className="min-w-0 p-4 bg-[#333]">
                        <input type="search" aria-label="Search question types" placeholder="Search question types..." className="field-control w-full text-left text-base" value={search} onChange={filter} />
                        <div className="text-left text-sm text-gray-300 my-3" role="status">{filteredGens.length} question types</div>
                        <div className="max-h-60 md:max-h-[28rem] overflow-y-auto p-1 space-y-1">
                            {filteredGens.map(q =>
                                <Button key={q} aria-pressed={selected === q} className={twMerge("block w-full text-left text-base leading-snug whitespace-normal break-words px-3 py-3 border-transparent bg-transparent text-white hover:bg-zinc-600", selected === q && "bg-gray-200 border-gray-200 text-black hover:bg-gray-300")} onClick={() => { setSelected(q) }}>
                                    {gens[q].name}
                                </Button>
                            )}
                            {filteredGens.length === 0 && <p className="text-gray-300 text-sm px-2">No matches. Try another search.</p>}
                        </div>
                    </div>
                    <div className="min-w-0 p-4 sm:p-6">
                        {active && selected
                            ? <QuestionInfo key={selected} questionGens={questionGens} selected={selected} practice={practice} />
                            : <div className="py-12 text-gray-300 text-base">Choose a question type to explore a sample and start practicing.</div>
                        }
                    </div>
                </div>
            </div>
        </>
    );

}