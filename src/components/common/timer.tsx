import { useState } from "react";

interface TimerProps {
    timeRef?: React.MutableRefObject<number>;
    intervalRef: React.MutableRefObject<NodeJS.Timeout | null>;
    shouldMakeInterval: boolean;
    doTimeUpdate: () => number;
    startingTime?: number;
};

export default function Timer({ timeRef, intervalRef, shouldMakeInterval, doTimeUpdate, startingTime = 0 }: TimerProps) {
    const [time, setTime] = useState<number>(startingTime);
    // Update optional time ref
    if (timeRef != null)
        timeRef.current = time;

    if (shouldMakeInterval && intervalRef.current == null) {
        intervalRef.current = setInterval(() => {
            const newT = doTimeUpdate();
            setTime(newT);
        }, 100);
    }
    else if (!shouldMakeInterval && intervalRef.current != null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }
    return (
        <div>{`${(time / 1000).toFixed(1)}s`}</div>
    );
}