import { getTestQuestions, submitLeaderboardEntry } from "@/util/database";
import { decryptSeed } from "@/util/encryptSeed";
import { calculateAdjustedScore, judgeQuestion } from "@/util/generator";
import { getSession } from "@/util/session";
import { getNumQuestions, LeaderboardEntry } from "@/util/types";
import { NextRequest, NextResponse } from "next/server";

interface Submission {
    testLength: number;
    gameMode: string;
    answers: string[];
    id: bigint;
    name: string;
};

export async function POST(request: NextRequest) {
    let submission: Submission | null = null;
    const session = await getSession();
    try {
        const body = await request.formData();
        const { testLength, gameMode, id } = session.testOptions;
        // const testLength = isValidTestLength(testOptions.testLength);
        // const gameMode = gameModes.find(gm => gameModeMappings[gm] === body.mode);
        // const id = BigInt(body.id);
        const answers = Array(testLength).fill(0).map((_, i) => body.get(`q${i}`) as string);
        const name = body.get("name") as string || "unknown";
        const idInt = BigInt(id);
        // Validate fields
        if (!testLength || !gameMode || !answers || answers.length !== testLength ||
            !answers.every((s: string) => typeof s === "string") || typeof idInt != "bigint")
            return Response.error();
        submission = {testLength: testLength, gameMode: gameMode, answers: answers, id: idInt, name: name};
        session.testOptions.id = "";
    }
    catch {}
    if (!submission || typeof submission != "object") {
        return Response.json("", {status: 500});
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
    const score = submission.gameMode === "Zetamac" ? correct : calculateAdjustedScore(correct, answered, submission.testLength);
    const entry: LeaderboardEntry = { name: submission.name.substring(0, 20), correct: correct, answered: answered, test_length: submission.testLength, adjusted: score, time: (Date.now() - session.testStart) / 1000 };
    submitLeaderboardEntry(submission.gameMode, entry);
    session.testResults = { questions: questions, judgements: judgements, answers: submission.answers, entry: entry };
    session.testStart = 0;
    await session.save();
    return NextResponse.redirect(new URL("/test/results", request.url));
    // return NextResponse.json(judgements.map((judgement, i) => `Q${i + 1}: ${questions[i].str} - ${judgement.correct ? "✔️" : `❌ (you put ${submission.answers[i]}, ans = ${getAnswerDisplay(questions[i])}`}`));
}