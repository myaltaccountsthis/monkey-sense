import { randomSeed } from "@/util/Base64";
import { encryptSeed } from "@/util/encryptSeed";
import { getSession } from "@/util/session";
import { gameModeMappings, gameModes } from "@/util/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const testLength = parseInt(searchParams.get("testLength") || "");
    const gameMode = gameModes.find(gm => gameModeMappings[gm] === searchParams.get("mode")) || "Number Sense";
    // Check if valid params
    if (isNaN(testLength))
        return NextResponse.error();
    const seed = randomSeed();
    const encrypted = encryptSeed(seed);
    const session = await getSession();
    session.testOptions = { id: encrypted.toString(), testLength: testLength, gameMode: gameMode };
    session.testResults = null;
    await session.save();
    return NextResponse.redirect(new URL("/test?t=" + Date.now().toString(), request.url));
}