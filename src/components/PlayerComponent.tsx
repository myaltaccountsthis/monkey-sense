import { UserData } from "../../backend/src/util/gametypes";
import Ring from "./AttemptsRing";

interface PlayerComponentProps {
    userData: UserData;
    rank: number;
    isYou: boolean;
    isLoading?: boolean;
}

export default function PlayerComponent({ userData, rank, isYou, isLoading }: PlayerComponentProps) {
    const { username, points, tries } = userData;
    
    return (
        <div className="flex justify-center flex-row border-black border-solid border-2 p-2 gap-4 items-center">
            <div className="text-2xl font-bold">
                {rank}.
            </div>
            {isLoading ? <div className="animate-pulse">Loading...</div> :
                <div className="flex justify-center flex-row items-center gap-4 pr-2">
                    <div>
                        <div>
                            {username}{isYou ? " (You)" : ""}
                        </div>
                        <div>
                            Score: {points.toFixed(1)}
                        </div>
                    </div>
                    <div>
                        <Ring ratio={tries / 3} />
                    </div>
                </div>
            }
        </div>
    )
}