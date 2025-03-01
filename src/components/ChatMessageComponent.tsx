import { ChatMessage } from "../../backend/src/util/gametypes";

interface ChatMessageProps {
    message: ChatMessage;
    alternate: boolean;
}

export default function ChatMessageComponent({ message, alternate }: ChatMessageProps) {
    const { userData, body, type } = message;

    return (
        <div className={`flex justify-start flex-row text-xl px-2 ${alternate ? "bg-zinc-600" : "bg-zinc-500"}`}>
            {type == "correct" ?
                <div className="font-bold text-green-500">
                    {userData.username} answered correctly!
                </div>
            :
                <>
                    <div className="font-bold">
                        {userData.username}: 
                    </div>
                    <div className="text-left flex-grow pl-2">
                        {body}
                    </div>
                </>
            }
        </div>
    )
}