import { getTestQuestions, handleSubmit } from "../../../backend/src/util/database";
import { encryptSeed } from "../../../backend/src/util/encrypt";
import { randomSeed } from "@/util/Base64";
import { TestOptions, gameModes, gameModeMappings, TestResults } from "@/util/types";
import TestClient from "@/components/test/TestClient";
import { getUser } from "@/app/(AUTH)/authhelper";

export default async function Test({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    let testOptions: TestOptions | null = null;
    const seed = randomSeed();
    const encrypted = encryptSeed(seed);
    const user = await getUser();
    const user_id = user ? user.user_id : 0;
    
    try {
        if (!searchParams)
            return <div>Error this should not appear</div>
        const testLength = parseInt(searchParams.testLength as string || "");
        if (isNaN(testLength))
            return <div>Invalid test length</div>
        const gameMode = gameModes.find(gm => gameModeMappings[gm] === searchParams.mode) || "Number Sense";
        testOptions = { id: encrypted.toString(), testLength: testLength, gameMode: gameMode };
    }
    catch (e) {
        console.log("err", e)
    }
    if (!testOptions)
        return (
            <div>Invalid test options</div>
        );

    
    const startT = Date.now();
    const questions = getTestQuestions(seed, testOptions.gameMode, testOptions.testLength).map(q => q.str);
    const onSubmit = async (formData: FormData) : Promise<TestResults | null> => {
        "use server";
        return await handleSubmit(formData, user_id);
    };

    return (
        <TestClient onSubmit={onSubmit} testOptions={testOptions} questions={questions} startT={startT} />
    )
}