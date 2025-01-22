import React from "react";

interface RingProps {
    ratio: number;
}

export default function Ring({ ratio }: RingProps) {
    const radius = 16;
    const strokeWidth = 6;
    const circumference = 2 * Math.PI * radius;
    const offset = (1 - ratio) * circumference;

    return (
        <svg
        className="w-12 h-12"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        >
            <circle
                className="text-gray-300 z-10"
                cx="24"
                cy="24"
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="none"
            />
            <circle
                className="text-green-500 z-20"
                cx="24"
                cy="24"
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 24 24)"
            />
        </svg>
    );
};
