"use client"

import { useRef, useState } from "react";
import Timer from "../common/timer";

interface TestTopBarProps {
    startT: number;
    testDuration: number;
    onSubmit: () => void;
};

export default function TestTopBar({ startT, testDuration, onSubmit }: TestTopBarProps) {
    const [done, setDone] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const doTimeUpdate = () => {
        const t = Date.now() - startT;
        if (t >= testDuration && !done) {
            onSubmit();
            setDone(true);
        }
        return t;
    };

    return (
        <div className="test-topbar sticky bg-[#555] border-0 border-b border-solid border-zinc-700 top-0 z-10 px-4 py-3 flex flex-wrap justify-center gap-x-8 gap-y-2 tabular-nums">
            <div className="font-semibold text-white">Monkey Sense Test</div>
            <Timer intervalRef={intervalRef} shouldMakeInterval={!done} doTimeUpdate={doTimeUpdate}></Timer>
        </div>
    )
}