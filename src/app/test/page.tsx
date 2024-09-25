import TestClient from "@/components/TestClient";
import { getTestQuestions } from "@/util/database";
import { decryptSeed } from "@/util/encryptSeed";
import { getSession } from "@/util/session"
import { redirect } from "next/navigation";
import "@/app/globals.css"

export default async function Test() {
    const session = await getSession();
    const testOptions = session.testOptions;
    if (!testOptions || !testOptions.id || testOptions.id.length === 0)
        redirect("/");
    
    const seed = decryptSeed(BigInt(testOptions.id));
    const questions = getTestQuestions(seed, testOptions.gameMode, testOptions.testLength).map(q => q.str);

    return (
        <TestClient strings={questions} />
    )
}