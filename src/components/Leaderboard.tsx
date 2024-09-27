import { GameMode, LeaderboardEntry } from "@/util/types"
import LeaderboardEntryComponent from "./LeaderboardEntryComponent";

interface LeaderboardProps {
    leaderboardEntries: {[key: GameMode]: LeaderboardEntry[]};
    gameMode: string;
}

export default function Leaderboard({ leaderboardEntries, gameMode }: LeaderboardProps) {
    return <>
        <div>Leaderboard
            {/* <label htmlFor="testlen">Test Length</label>
            <select id="testlen">
                <option>Yo yo yo</option>
                <option>It's hump day</option>
            </select> */}
        </div>
        { leaderboardEntries[gameMode] ? 
            <table className="m-auto border-spacing-x-2">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>C</th>
                        <th>T</th>
                        <th>L</th>
                        <th>ADJ</th>
                        <th>T</th>
                    </tr>
                    { leaderboardEntries[gameMode].map((entry, i) =>
                        <LeaderboardEntryComponent key={i} entry={entry} i={i} />
                    )}
                </tbody>
            </table>
            : <div>Loading leaderboards...</div> }
    </>
}