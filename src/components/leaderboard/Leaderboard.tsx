import { GameMode, testLengths, ViewableLeadeboardEntry } from "@/util/types"
import LeaderboardEntryComponent from "./LeaderboardEntryComponent";

interface LeaderboardProps {
    leaderboardEntries: {[key: GameMode]: ViewableLeadeboardEntry[][]};
    gameMode: string;
    testLength: number;
    setTestLength: (testLength: number) => void;
}

export default function Leaderboard({ leaderboardEntries, gameMode, testLength, setTestLength }: LeaderboardProps) {
    const testLengthIndex = testLengths.indexOf(testLength);

    // TODO split by test length
    return <div className="w-fit m-auto">
        <div className="text-3xl">Leaderboard</div>
        <div className="my-2">
            {
                leaderboardEntries[gameMode] // If the game mode is not in the leaderboard, it will be undefined, show loading
                ?
                    (leaderboardEntries[gameMode][testLengthIndex].length // Empty leaderboard for this test length
                    ?
                        <table className="m-auto border-spacing-x-2">
                            <tbody>
                                <tr>
                                    <th>Username</th>
                                    <th>Correct</th>
                                    <th>Total</th>
                                    <th>Adj. Score</th>
                                    <th>Time</th>
                                </tr>
                                { leaderboardEntries[gameMode][testLengthIndex].map((entry, i) =>
                                    <LeaderboardEntryComponent key={i} entry={entry} i={i} />
                                )}
                            </tbody>
                        </table>
                    : <div>No entries found</div>)
                : <div>Loading leaderboards...</div>
            }
        </div>
        <div className="flex flex-row gap-x-1 justify-center items-center w-full *:bg-transparent *:text-white *:m-1">
            <div>Test Length</div>
            { testLengths.map(length => <button className={`${testLength === length ? "border-gray-300 " : ""}hover:cursor-pointer`} key={length} onClick={() => setTestLength(length)}>{length}</button>) }
        </div>
    </div>
}