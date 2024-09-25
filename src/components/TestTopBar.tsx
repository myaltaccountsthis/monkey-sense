"use client"

import { useRef, useState } from "react";
import Timer from "./timer";

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
        <div className="overflow-hidden sticky bg-[#555] top-0 z-10">
            <div>Funny topbar</div>
            <Timer intervalRef={intervalRef} shouldMakeInterval={!done} doTimeUpdate={doTimeUpdate}></Timer>
        </div>
    )
}