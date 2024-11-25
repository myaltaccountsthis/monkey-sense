import { Pool } from "pg";
import { GameMode, gameModeMappings, getNumQuestions, getTestDuration, LeaderboardEntry, ModeData, Question, TestResults } from "./types";
import { calculateAdjustedScore, judgeQuestion, QuestionGeneratorList, RNG } from "./generator";
import { decryptSeed } from "./encryptSeed";
import { Filter } from 'bad-words';

const pool = new Pool({
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.HOST,
    port: parseInt(process.env.PG_PORT!),
    database: process.env.PG_DATABASE
});

const filter = new Filter();

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
        // const isGuess = question.guess;
        // if (isGuess)
            // question.str = question.str.replace("*", "");
    }
    return questions;
}

// Submit graded test to the leaderboard
export async function submitLeaderboardEntry(gameMode: GameMode, entry: LeaderboardEntry) {
    if (entry.answered * 2 < entry.test_length)
        return [];
    return (await pool.query(`INSERT INTO leaderboard_${gameModeMappings[gameMode]} VALUES ($1, $2, $3, $4, $5, $6)`, [entry.name, entry.correct, entry.answered, entry.test_length, entry.adjusted, entry.time])).rows;
}

interface Submission {
    testLength: number;
    gameMode: string;
    answers: string[];
    id: string;
    name: string;
    time: number;
};

export async function handleSubmit(body: FormData): Promise<TestResults | null> {
    let submission: Submission | null = null;
    try {
        const testLength = parseInt(body.get("testLength") as string);
        const gameMode = body.get("mode") as string;
        const id = body.get("id") as string;
        const time = parseFloat(body.get("time") as string);
        // const testLength = isValidTestLength(testOptions.testLength);
        // const gameMode = gameModes.find(gm => gameModeMappings[gm] === body.mode);
        // const id = BigInt(body.id);
        const answers = Array(testLength).fill(0).map((_, i) => body.get(`q${i}`) as string);
        const name = body.get("name") as string || "unknown";
        // Validate fields
        const testDuration = getTestDuration(gameMode, testLength) / 1000;
        if (!testLength || !gameMode || !answers || answers.length !== testLength || time > testDuration + 1 ||
            !answers.every((s: string) => typeof s === "string"))
            throw "Bad";
        submission = {testLength: testLength, gameMode: gameMode, answers: answers, id: id, name: name, time: Math.min(time, testDuration)};
    }
    catch {}
    // If error parsing client request, then return Bad Request
    if (!submission || typeof submission != "object") {
        return null;
    }
    // Grade submission
    let correct = 0;
    let answered = 0;
    let hasAnsweredQuestion = false;
    const { seed, time } = decryptSeed(submission.id);
    if (Date.now() - time - submission.time * 1000 > 15000) {
        console.log(submission.name, "took too long to submit");
        return null;
    }
    const questions = getTestQuestions(seed, submission.gameMode, getNumQuestions(submission.gameMode, submission.testLength));
    const judgements = [];
    for (let i = submission.testLength - 1; i >= 0; i--) {
        hasAnsweredQuestion ||= submission.answers[i].length > 0;
        if (hasAnsweredQuestion) {
            answered++;
            const judgement = judgeQuestion(questions[i], submission.answers[i]);
            judgements.push(judgement);
            if (judgement.correct)
                correct++;
        }
    }
    judgements.reverse();
    const score = submission.gameMode === "Zetamac" ? correct / submission.testLength * 120 : calculateAdjustedScore(correct, answered, submission.testLength);
    const entry: LeaderboardEntry = { name: filter.clean(submission.name.substring(0, 20)), correct: correct, answered: answered, test_length: submission.testLength, adjusted: score, time: submission.time };
    submitLeaderboardEntry(submission.gameMode, entry);
    return { questions: questions, judgements: judgements, answers: submission.answers, entry: entry };
    // return NextResponse.json(judgements.map((judgement, i) => `Q${i + 1}: ${questions[i].str} - ${judgement.correct ? "✔️" : `❌ (you put ${submission.answers[i]}, ans = ${getAnswerDisplay(questions[i])}`}`));
}