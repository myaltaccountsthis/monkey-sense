import { randomSeed } from "@/util/Base64";
import { getTestQuestions } from "@/util/database";
import { encryptSeed } from "@/util/encryptSeed";
import { gameModeMappings, gameModes, TestOptions } from "@/util/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    let testOptions: TestOptions | null = null;
    const seed = randomSeed();
    const encrypted = encryptSeed(seed);
    try {
        const searchParams = request.nextUrl.searchParams;
        const testLength = parseInt(searchParams.get("testLength") || "");
        const gameMode = gameModes.find(gm => gameModeMappings[gm] === searchParams.get("mode")) || "Number Sense";
        testOptions = { id: encrypted.toString() , testLength: testLength, gameMode: gameMode };
    }
    catch {}
    if (!testOptions)
        return NextResponse.json("", {status: 400});
    return NextResponse.json({ id: testOptions.id, questions: getTestQuestions(seed, testOptions.gameMode, testOptions.testLength).map(q => q.str) });
}