import { ChatMessage } from "../../backend/src/util/gametypes";
import ChatMessageComponent from "./ChatMessageComponent";

interface ChatLogProps {
    messages: ChatMessage[];
}

export default function ChatLog({ messages }: ChatLogProps) {
    return (
        <div className="border-black border-2 border-solid w-2/5 min-w-32 bg-zinc-700 max-h-[500px] rounded-md">
            <h2 className="text-center text-3xl font-bold">Guesses</h2>
            <div className="overflow-y-auto h-[400px] flex flex-col">
                {messages.map((message, i) => (
                    <ChatMessageComponent key={i} message={message} alternate={i % 2 == 1} />
                ))}
            </div>
        </div>
    );
}