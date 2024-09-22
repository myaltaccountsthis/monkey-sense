import { useState } from "react";

interface TimerProps {
    intervalRef: React.MutableRefObject<NodeJS.Timeout | null>;
    shouldMakeInterval: boolean;
    doTimeUpdate: () => number;
};

export default function Timer({ intervalRef, shouldMakeInterval, doTimeUpdate }: TimerProps) {
    const [time, setTime] = useState<number>(0);
    if (shouldMakeInterval && intervalRef.current == null) {
        intervalRef.current = setInterval(() => {
            setTime(doTimeUpdate());
        }, 100);
    }
    else if (!shouldMakeInterval && intervalRef.current != null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }
    return (
        <div id="totaltime">{`${(time / 1000).toFixed(1)}s`}</div>
    );
}