import { Pool } from "pg";
import { gameModeMappings, LeaderboardEntry } from "./types";

const pool = new Pool({
    user: "postgres",
    password: "Monkey123",
    host: "localhost",
    port: 5432,
    database: "monkey-sense"
});

export async function getLeaderboard(leaderboardKey: string | null): Promise<LeaderboardEntry[]> {
    if (!leaderboardKey || !Object.values(gameModeMappings).includes(leaderboardKey))
        return [];
    return (await pool.query(`SELECT * FROM leaderboard_${leaderboardKey}`)).rows;
}