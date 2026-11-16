import { ChatMessage } from "../../backend/src/util/gametypes";

interface ChatMessageProps {
    message: ChatMessage;
    alternate: boolean;
}

export default function ChatMessageComponent({ message, alternate }: ChatMessageProps) {
    const { userData, body, type } = message;

    return (
        <div className={`flex flex-wrap justify-start flex-row gap-x-2 px-4 py-3 break-words ${alternate ? "bg-zinc-600" : "bg-zinc-700"}`}>
            {type == "correct" ?
                <div className="min-w-0 text-base font-medium text-green-400">
                    {userData.username} answered correctly!
                </div>
            :
                <>
                    <div className="min-w-0 text-base font-semibold">
                        {userData.username}: 
                    </div>
                    <div className="min-w-0 text-left text-base text-zinc-300">
                        {body}
                    </div>
                </>
            }
        </div>
    )
}