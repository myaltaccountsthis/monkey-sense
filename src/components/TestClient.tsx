"use client"

import { getTestDuration, MathJaxConfig, TestResults } from "@/util/types";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import TestTopBar from "@/components/TestTopBar";
import { useEffect, useRef, useState } from "react";
import { redirect, useRouter } from "next/navigation";

interface TestClientProps {
    onSubmit: (formData: FormData) => Promise<TestResults | null>;
};

export default function TestClient({ onSubmit }: TestClientProps) {
    const [loaded, setLoaded] = useState(false);
    const submittedRef = useRef(false);
    const dataRef = useRef<any | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    useEffect(() => {
        const dataStr = sessionStorage.getItem("TestData");
        if (!dataStr)
            redirect("/");
        dataRef.current = JSON.parse(dataStr);
        setLoaded(true);
    }, []);

    if (!loaded)
        return <div>Loading test...</div>;
    
    const testData = dataRef.current;
    const strings: string[] = testData.questions;
    const startT = Date.now();
    const testDuration = getTestDuration(testData.gameMode, testData.testLength);

    const ignoreEnter = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === "Enter" && e.currentTarget.getAttribute("type") !== "submit")
            e.preventDefault();
    };
    const onClientSubmit = (formData: FormData) => {
        if (submittedRef.current)
            return;
        submittedRef.current = true;
        formData.set("id", testData.id);
        formData.set("mode", testData.gameMode);
        formData.set("testLength", testData.testLength);
        formData.set("time", ((Date.now() - startT) / 1000).toString());
        let name;
        do {
            name = prompt("Enter your name: ");
        }
        while (!name);
        formData.set("name", name);
        onSubmit(formData).then(result => {
            sessionStorage.setItem("TestResults", JSON.stringify(result));
            router.push("/test/results");
        });
    };
    
    return (
        <MathJaxContext config={MathJaxConfig}>
            <TestTopBar startT={startT} testDuration={testDuration} onSubmit={() => formRef.current?.requestSubmit()} />
            <br/>
            <form ref={formRef} action={onClientSubmit} onKeyDown={ignoreEnter}>
                <div className="flex flex-col items-center gap-y-4 flex-wrap px-4">
                    {
                        strings.map((str, i) =>
                            <div key={i} className="text-2xl w-full flex flex-row gap-x-2">
                                <MathJax className="text-left ml-10 -indent-10 flex-auto" inline tabIndex={-1}>{i + 1}. {str}</MathJax>
                                <input name={`q${i}`} className="text-2xl flex-shrink text-black" type="text" autoComplete="off" />
                            </div>
                        )
                    }
                </div>
                <br/>
                <input className="mx-auto my-4 text-2xl text-black px-2 py-1" type="submit" value="Submit" />
            </form>
        </MathJaxContext>
    );
}