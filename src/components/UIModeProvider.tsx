"use client";

import { createContext, useContext, useState } from "react";

export type UIMode = "modern" | "old";

const UIModeContext = createContext<{ mode: UIMode; toggleMode: () => void } | null>(null);

export default function UIModeProvider({ initialMode, children }: { initialMode: UIMode; children: React.ReactNode }) {
    const [mode, setMode] = useState<UIMode>(initialMode);

    const toggleMode = () => {
        const nextMode = mode === "modern" ? "old" : "modern";
        document.cookie = `ui-mode=${nextMode}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
        document.body.dataset.uiMode = nextMode;
        setMode(nextMode);
    };

    return (
        <UIModeContext.Provider value={{ mode, toggleMode }}>
            {children}
        </UIModeContext.Provider>
    );
}

export function useUIMode() {
    const context = useContext(UIModeContext);
    if (!context)
        throw new Error("useUIMode must be used within UIModeProvider");
    return context;
}
