"use client";

import { useState } from "react";
import Duel from "./Duel";

export default function DuelResetter({ token }: { token?: string }) {
    const [shouldReset, setShouldReset] = useState(false);
	if (shouldReset) {
        setTimeout(() => setShouldReset(false));
		return <h1>Reloading...</h1>
	}
	return <Duel reset={() => setShouldReset(true)} token={token} />
}