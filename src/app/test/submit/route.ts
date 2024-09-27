import { getTestQuestions, submitLeaderboardEntry } from "@/util/database";
import { decryptSeed } from "@/util/encryptSeed";
import { calculateAdjustedScore, judgeQuestion } from "@/util/generator";
import { gameModeMappings, gameModes, getNumQuestions, getTestDuration, LeaderboardEntry, TestResults } from "@/util/types";
import { NextRequest, NextResponse } from "next/server";

interface Submission {
    testLength: number;
    gameMode: string;
    answers: string[];
    id: bigint;
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
        const idInt = BigInt(id);
        // Validate fields
        const testDuration = getTestDuration(gameMode, testLength) / 1000;
        if (!testLength || !gameMode || !answers || answers.length !== testLength || time > testDuration + 1 ||
            !answers.every((s: string) => typeof s === "string") || typeof idInt != "bigint")
            throw "Bad";
        submission = {testLength: testLength, gameMode: gameMode, answers: answers, id: idInt, name: name, time: Math.min(time, testDuration)};
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
    const questions = getTestQuestions(decryptSeed(submission.id), submission.gameMode, getNumQuestions(submission.gameMode, submission.testLength));
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
    const entry: LeaderboardEntry = { name: submission.name.substring(0, 20), correct: correct, answered: answered, test_length: submission.testLength, adjusted: score, time: submission.time };
    submitLeaderboardEntry(submission.gameMode, entry);
    return { questions: questions, judgements: judgements, answers: submission.answers, entry: entry };
    // return NextResponse.json(judgements.map((judgement, i) => `Q${i + 1}: ${questions[i].str} - ${judgement.correct ? "✔️" : `❌ (you put ${submission.answers[i]}, ans = ${getAnswerDisplay(questions[i])}`}`));
}

export async function POST(request: NextRequest) {
    const data = await handleSubmit(await request.formData());
    if (!data)
        return NextResponse.json("", {status: 400});
    return NextResponse.json(data);
}