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
    return <div className="leaderboard-view surface-panel mt-6 overflow-hidden">
        <div className="leaderboard-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5">
            <div className="text-left">
                <h2 className="text-2xl font-semibold m-0">Leaderboard</h2>
                <p className="modern-ui-only text-sm text-gray-300 mt-1 mb-0">{gameMode} &middot; {testLength}{gameMode === "Zetamac" ? " seconds" : " questions"}</p>
            </div>
            <div className="leaderboard-controls flex flex-wrap gap-1 rounded-md bg-[#333] p-1" role="group" aria-label="Leaderboard test length">
                <span className="old-ui-only">Test Length</span>
                { testLengths.map(length => <button aria-pressed={testLength === length} className={`rounded-md border-0 px-3 py-2 text-sm transition-colors hover:cursor-pointer ${testLength === length ? "bg-gray-200 text-black" : "bg-transparent text-zinc-300 hover:bg-zinc-600"}`} key={length} onClick={() => setTestLength(length)}>{length}</button>) }
            </div>
        </div>
        <div className="overflow-x-auto">
            {
                leaderboardEntries[gameMode] // If the game mode is not in the leaderboard, it will be undefined, show loading
                ?
                    (leaderboardEntries[gameMode][testLengthIndex].length // Empty leaderboard for this test length
                    ?
                        <table aria-label={`${gameMode} leaderboard`} className="w-full border-collapse whitespace-nowrap text-base tabular-nums [&_th]:px-4 [&_th]:py-3 [&_td]:px-4 [&_td]:py-3 [&_tbody_tr]:border-0 [&_tbody_tr]:border-t [&_tbody_tr]:border-solid [&_tbody_tr]:border-zinc-600 [&_tbody_tr:hover]:bg-zinc-600">
                            <thead className="bg-[#282828] text-gray-300 text-sm">
                                <tr>
                                    <th>Username</th>
                                    <th>Correct</th>
                                    <th>Total</th>
                                    <th>Adj. Score</th>
                                    <th>Time (s)</th>
                                </tr>
                            </thead>
                            <tbody>
                                { leaderboardEntries[gameMode][testLengthIndex].map((entry, i) =>
                                    <LeaderboardEntryComponent key={i} entry={entry} i={i} />
                                )}
                            </tbody>
                        </table>
                    : <div className="p-8 text-base text-gray-300">No scores yet. Complete a test to join the leaderboard.</div>)
                : <div className="p-8 text-base text-gray-300" role="status">Loading leaderboards...</div>
            }
        </div>
    </div>
}