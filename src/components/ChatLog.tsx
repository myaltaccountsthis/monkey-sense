import { ChatMessage } from "../../backend/src/util/gametypes";
import ChatMessageComponent from "./ChatMessageComponent";

interface ChatLogProps {
    messages: ChatMessage[];
}

export default function ChatLog({ messages }: ChatLogProps) {
    return (
        <div>
            {messages.map((message, i) => (
                <ChatMessageComponent key={i} message={message} alternate={i % 2 == 1} />
            ))}
        </div>
    );
}