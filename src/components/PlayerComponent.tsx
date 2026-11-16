import { twMerge } from "tailwind-merge";
import { FULL_POINTS, NUM_TRIES, DuelUserData } from "../../backend/src/util/gametypes";
import { getNumberRankStr } from "../../backend/src/util/generator";
import Ring from "./AttemptsRing";

interface PlayerComponentProps {
    userData: DuelUserData;
    rank: number;
    isYou: boolean;
    isLoading?: boolean;
    showDelta?: boolean;
}

const getPointsColor = (points: number) => {
    const ratio = points / FULL_POINTS;
    const blueEnd = .9, green = .75, yellow = .5, redEnd = 0;
    const r = Math.max(0, Math.min(1, (green - ratio) / (green - yellow))) * 0xff;
    const g = Math.max(0, Math.min(1, 1 - (yellow - ratio) / (yellow - redEnd))) * 0xff;
    const b = Math.max(0, Math.min(1, 1 - (blueEnd - ratio) / (blueEnd - green))) * 0xff;
    return `rgb(${r}, ${g}, ${b})`;
};

const getTriesColor = (tries: number) => {
    if (tries == NUM_TRIES)
        return "";
    if (tries == NUM_TRIES - 1)
        return "#ff0";
    if (tries == NUM_TRIES - 2)
        return "#f80";
    return "#f00";
}

export default function PlayerComponent({ userData, rank, isYou, isLoading, showDelta }: PlayerComponentProps) {
    const { username, points, tries } = userData;
    
    return (
        <div className={twMerge("player-card flex justify-center flex-row rounded-md bg-[#333] border-black border-solid border p-3 gap-3 items-center", isYou && "border-gray-300", showDelta && userData.answeredCorrect && "border-green-600")}>
            <div className="text-2xl font-bold">
                {rank}.
            </div>
            {isLoading ? <div className="animate-pulse">Loading...</div> :
                <div className="flex min-w-0 justify-center flex-row items-center gap-3">
                    <div className="min-w-0 break-words">
                        <div>
                            {username}{isYou ? " (You)" : ""}
                        </div>
                        <div>
                            Score: {points.toFixed(1)}
                            <br />
                            {
                                showDelta && <span>
                                    <span style={{ color: getPointsColor(userData.delta) }}> +{userData.delta.toFixed(1)}</span>
                                    {
                                        userData.answeredCorrect && <span> — <span style={{ color: getTriesColor(userData.tries) }}>{getNumberRankStr(NUM_TRIES + 1 - userData.tries)} try</span></span>
                                    }
                                </span>
                            }
                        </div>
                    </div>
                    <div className="shrink-0">
                        <Ring ratio={tries / 3} />
                    </div>
                </div>
            }
        </div>
    )
}