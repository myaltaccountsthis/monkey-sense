import { QuestionGenerator } from "../util/types";
import Button from "./Button";

interface QuestionInfoProps {
    id: string;
    question: QuestionGenerator;
    selected: string | null;
    update: (name: string) => void;
}

export default function QuestionInfo({ id, question, selected, update }: QuestionInfoProps) {
    const onClick = () => {
        update(id);
    };
    return (
        <Button className={`w-full ${selected == id ? "bg-zinc-400" : "bg-zinc-600"} hover:bg-zinc-500 active:bg-zinc-400 hover:scale-x-100 rounded-none border-l-0 min-h-20 border-t-0`} onClick={onClick}>
            <div className="text-gray-200">{question.name}</div>
        </Button>
    );
}