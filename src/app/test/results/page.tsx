"use client"

import TestResults from "@/components/TestResults";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Results() {
    const [loaded, setLoaded] = useState(false);
    const dataRef = useRef<any | null>(null);

    useEffect(() => {
        dataRef.current = JSON.parse(sessionStorage?.getItem("TestResults")!);
        setLoaded(true);
    }, []);

    if (!loaded)
        return <div>Loading results...</div>

    const testResults = dataRef.current;
    if (!testResults)
        redirect("/");

    return (
        <div>
            <div>
                <h1>Your Results</h1>
                <div>Out of {testResults.entry.answered} questions answered</div>
                <div>{testResults.entry.correct} were correct</div>
                <div>Test had {testResults.entry.test_length} questions</div>
            </div>
            <br/>
            <div>Questions</div>
            <TestResults testResults={testResults} />
            <br/>
            <Link href="/">
                <button>Return</button>
            </Link>
        </div>
    );
}