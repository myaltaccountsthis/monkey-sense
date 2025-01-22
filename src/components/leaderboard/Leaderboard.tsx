import { GameMode, testLengths, ViewableLeadeboardEntry } from "@/../backend/src/util/types"
import LeaderboardEntryComponent from "./LeaderboardEntryComponent";

interface LeaderboardProps {
    leaderboardEntries: {[key: GameMode]: ViewableLeadeboardEntry[][]};
    gameMode: string;
    testLength: number;
}

export default function Leaderboard({ leaderboardEntries, gameMode, testLength }: LeaderboardProps) {
    const testLengthIndex = testLengths.indexOf(testLength);

    // TODO split by test length
    return <>
        <div className="mb-2">Leaderboard
            {/* <label htmlFor="testlen">Test Length</label>
            <select id="testlen">
                <option>Yo yo yo</option>
                <option>It's hump day</option>
            </select> */}
        </div>
        { leaderboardEntries[gameMode] && leaderboardEntries[gameMode][testLengthIndex] ? 
            <table className="m-auto border-spacing-x-2">
                <tbody>
                    <tr>
                        <th>Username</th>
                        <th>Correct</th>
                        <th>Total</th>
                        <th>Length</th>
                        <th>Adj. Score</th>
                        <th>Time</th>
                    </tr>
                    { leaderboardEntries[gameMode][testLengthIndex].map((entry, i) =>
                        <LeaderboardEntryComponent key={i} entry={entry} i={i} />
                    )}
                </tbody>
            </table>
            : <div>Loading leaderboards...</div> }
    </>
}