"use client";

import { Suspense } from "react";
import Print from "./Print";

export default function Page() {
    return (
        <Suspense>
            <Print />
        </Suspense>
    );
}