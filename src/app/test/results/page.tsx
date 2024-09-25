import TestResults from "@/components/TestResults";
import { getSession } from "@/util/session";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Results() {
    const session = await getSession();
    const testResults = session.testResults;
    if (!testResults)
        redirect("/");

    return (
        <div>
            <div>
                <div>Your Results</div>
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