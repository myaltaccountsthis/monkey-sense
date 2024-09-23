import { getLeaderboard } from "@/util/database";
import { GameMode, gameModeMappings, gameModes, LeaderboardEntry } from "@/util/types";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const gameMode = request.nextUrl.searchParams.get("mode");
    if (gameMode === "all") {
        const data: {[key: GameMode]: LeaderboardEntry[]} = {};
        (await Promise.all(gameModes.map(gameMode => getLeaderboard(gameModeMappings[gameMode])))).forEach((val, i) => data[gameModes[i]] = val);
        return Response.json(data);
    }
    return Response.json(await getLeaderboard(gameMode));
}