"use client"

import { useRef } from "react";
import Timer from "./timer";

export default function NavBar() {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTRef = useRef(Date.now());
    const doTimeUpdate = () => {
        const t = Date.now() - startTRef.current;
        return t;
    };

    return (
        <div className="overflow-hidden sticky bg-[#555] top-0">
            <div>Funny NavBar</div>
            <Timer intervalRef={intervalRef} shouldMakeInterval={true} doTimeUpdate={doTimeUpdate}></Timer>
        </div>
    )
}