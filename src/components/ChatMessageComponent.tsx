import { ChatMessage } from "../../backend/src/util/gametypes";

interface ChatMessageProps {
    message: ChatMessage;
    alternate: boolean;
}

export default function ChatMessageComponent({ message, alternate }: ChatMessageProps) {
    const { userData, body, type } = message;
    
    const color = type === "incorrect" ? "text-red-500" : (type === "correct" ? "text-green-500" : "text-black");

    return (
        <div className={`flex justify-center flex-row ${color} ${alternate ? "bg-zinc-600" : "bg-zinc-500"}`}>
            <div className="text-xl font-bold">
                {userData.username}
            </div>
            <div className="text-base">
                {body}
            </div>
        </div>
    )
}