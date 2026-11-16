import { ChatMessage } from "../../backend/src/util/gametypes";
import ChatMessageComponent from "./ChatMessageComponent";

interface ChatLogProps {
    messages: ChatMessage[];
}

export default function ChatLog({ messages }: ChatLogProps) {
    return (
        <div className="surface-panel w-full min-w-0 overflow-hidden">
            <h2 className="text-center my-4">Guesses</h2>
            <div className="overflow-y-auto h-[400px] flex flex-col">
                {messages.map((message, i) => (
                    <ChatMessageComponent key={i} message={message} alternate={i % 2 == 1} />
                ))}
            </div>
        </div>
    );
}