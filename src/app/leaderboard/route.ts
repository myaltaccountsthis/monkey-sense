import { getLeaderboard } from "../../../backend/src/util/database";
import { GameMode, gameModeMappings, gameModes, LeaderboardEntry, testLengths } from "@/../backend/src/util/types";
import { NextRequest, NextResponse } from "next/server";

const cacheLifetime = 60000;
let prevCache: { [key: GameMode]: LeaderboardEntry[][] } = {};
let prevCacheTime = 0;

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const t = Date.now();
    if (t - prevCacheTime > cacheLifetime) {
        console.log("Refreshing leaderboard cache");
        prevCacheTime = t;
        const data: { [key: GameMode]: LeaderboardEntry[][] } = {};
        // Fetch leaderboards for all game modes and test lengths
        ( await Promise.all(
            gameModes.map(async gameMode => 
                await Promise.all(testLengths.map(length =>
                    getLeaderboard(gameModeMappings[gameMode], length)
                ))
            )
        )).forEach((val, i) => data[gameModes[i]] = val);
        prevCache = data;
    }
    const gameMode = request.nextUrl.searchParams.get("mode");
    if (gameMode === "all")
        return NextResponse.json(prevCache);
    else if (!gameMode)
        return NextResponse.json("Invalid game mode", {status: 400});
    return NextResponse.json(prevCache[gameMode]);
}