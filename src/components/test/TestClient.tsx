"use client";

import { getTestDuration, MathJaxConfig, TestOptions, TestResults } from "@/util/types";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import TestTopBar from "@/components/test/TestTopBar";
import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface TestClientProps {
    onSubmit: (formData: FormData) => Promise<TestResults | null>;
    testOptions: TestOptions;
    questions: string[];
    startT: number;
};

export default function TestClient({ onSubmit, testOptions, questions, startT }: TestClientProps) {
    const router = useRouter();

    const formRef = useRef<HTMLFormElement>(null);
    const submittedRef = useRef(false);

    const testDuration = getTestDuration(testOptions.gameMode, testOptions.testLength);

    const ignoreEnter = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === "Enter" && (e.target as HTMLInputElement).type !== "submit")
            e.preventDefault();
    };

    const onClientSubmit = useCallback(async (formData: FormData) => {
        const result = await onSubmit(formData);
        if (submittedRef.current)
            return;
        submittedRef.current = true;

        sessionStorage.setItem("TestResults", JSON.stringify(result));
        router.push("/test/results");
    }, [onSubmit]);
    
    return (
        <MathJaxContext config={MathJaxConfig}>
            <TestTopBar startT={startT} testDuration={testDuration} onSubmit={() => formRef.current?.requestSubmit()} />
            <br/>
            <form ref={formRef} action={onClientSubmit} onKeyDown={ignoreEnter}>
                <div className="flex flex-col items-center gap-y-4 flex-wrap px-4">
                    {
                        questions.map((str, i) =>
                            <div key={i} className="text-2xl w-full flex flex-row gap-x-2">
                                <MathJax className="text-left ml-10 -indent-10 flex-auto" inline tabIndex={-1}>{i + 1}. {str}</MathJax>
                                <input name={`q${i}`} className="text-2xl flex-shrink text-black" type="text" autoComplete="off" />
                            </div>
                        )
                    }
                </div>
                <br/>
                <input className="mx-auto my-4 text-2xl text-black px-2 py-1" type="submit" value="Submit" />
                <input type="hidden" name="id" value={testOptions.id} />
                <input type="hidden" name="mode" value={testOptions.gameMode} />
                <input type="hidden" name="testLength" value={testOptions.testLength} />
            </form>
        </MathJaxContext>
    );
}