import { UserData } from "../../backend/src/util/gametypes";

interface PlayerComponentProps {
    userData: UserData;
    rank: number;
}

export default function PlayerComponent({ userData, rank }: PlayerComponentProps) {
    const { username, points, tries } = userData;
    
    return (
        <div className="flex justify-center flex-row border-black border-solid border-2 p-2 ">
            <div className="text-2xl font-bold">
                {rank}.
            </div>
            <div>
                <div>
                    {username}
                </div>
                <div>
                    Score: {points}
                </div>
            </div>
            <div>
                HP: {3 - tries}
            </div>
        </div>
    )
}