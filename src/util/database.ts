import { Pool } from "pg";
import { GameMode, gameModeMappings, LeaderboardEntry, ModeData, Question } from "./types";
import { QuestionGeneratorList, RNG } from "./generator";

const pool = new Pool({
    user: "postgres",
    password: "Monkey123",
    host: "localhost",
    port: 5432,
    database: "monkey-sense"
});

// Fetch leaderboard of specific game mode
export async function getLeaderboard(leaderboardKey: string | null): Promise<LeaderboardEntry[]> {
    if (!leaderboardKey || !Object.values(gameModeMappings).includes(leaderboardKey))
        return [];
    return (await pool.query(`SELECT * FROM leaderboard_${leaderboardKey} ORDER BY adjusted DESC LIMIT 10`)).rows;
}

// Generate random test questions with the given seed
export function getTestQuestions(seed: string, gameMode: GameMode, testLength: number) {
    const questionGen = new QuestionGeneratorList(new RNG(seed));
    const modeData: ModeData = {lastT: Date.now(), total: 0, testLength: testLength, question: {ans: 0, str: ""}, enterMode: "Test", gameMode: gameMode};
    const questions = [];
    for (let offset = 0; offset < testLength; offset++) {
        const shouldBeEstimate = gameMode === "Estimate" || gameMode === "Number Sense" && (offset + 1) % 10 == 0;
        let question: Question;
        do {
            question = questionGen.generateQuestion(modeData, undefined, Math.floor(offset / (testLength / 4))).question;
        }
        while ((question.guess === true) != shouldBeEstimate);
        modeData.total++;
        questions.push(question);
        const isGuess = question.guess;
        if (isGuess)
            question.str = question.str.replace("*", "");
    }
    return questions;
}

// Submit graded test to the leaderboard
export async function submitLeaderboardEntry(gameMode: GameMode, entry: LeaderboardEntry) {
    if (entry.answered * 2 < entry.test_length)
        return [];
    return (await pool.query(`INSERT INTO leaderboard_${gameModeMappings[gameMode]} VALUES ($1, $2, $3, $4, $5)`, [entry.name, entry.correct, entry.answered, entry.test_length, entry.adjusted])).rows;
}