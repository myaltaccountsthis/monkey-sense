import QuestionInfo from "./QuestionInfo";
import { FormEvent, useState } from "react";
import { QuestionGeneratorList } from "../../backend/src/util/generator";
import Button from "./Button";

interface QuestionListProps {
    questionGens: QuestionGeneratorList;
    startPractice: (question: string) => void;
}

export default function QuestionList({ questionGens, startPractice }: QuestionListProps) {
    const gens = questionGens.questionGens;
    const sortedGens = Object.keys(gens).sort((a, b) => (gens[a].tier - gens[b].tier) * 100 - (gens[a].weight - gens[b].weight));
    const [filteredGens, setFilteredGens] = useState<string[]>(sortedGens);

    const [active, setActive] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);

    const open = () => setActive(!active);
    const practice = () => {
        if (selected) {
            startPractice(selected);
        }
    }

    const filter = (e: FormEvent<HTMLInputElement>) => {
        const search = e.currentTarget.value;
        setFilteredGens(sortedGens.filter(q => gens[q].name.toLowerCase().includes(search.toLowerCase())));
        setSelected(null);
    }

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
                    <div className="flex flex-row gap-2 items-start w-full">
                        <div className="w-1/2 max-w-48">
                            <input type="text" placeholder="Search" className="w-full box-border p-2 rounded-md border-2 border-black border-solid text-black" onChange={filter} />
                            <div className="flex flex-col justify-start items-start overflow-y-scroll w-full max-h-[600px] bg-zinc-600 rounded-md border-2 border-black border-solid p-0 overflow-x-clip">
                                {filteredGens.map((q, i) =>
                                    <Button key={i} className={`w-full px-2 ${selected == q ? "bg-zinc-400" : "bg-zinc-600"} hover:bg-zinc-500 active:bg-zinc-400 hover:scale-x-100 rounded-none border-l-0 min-h-20 border-t-0`} onClick={() => { setSelected(q) }}>
                                        <div className="text-gray-200">{gens[q].name}</div>
                                    </Button>
                                )}
                            </div>
                        </div>
                        {selected &&
                            <QuestionInfo questionGens={questionGens} selected={selected} practice={practice} />
                        }
                    </div>
                </div>
            </div>
        </>
    );

}