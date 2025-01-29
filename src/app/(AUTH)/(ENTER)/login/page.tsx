"use client";

import { useState, useTransition } from "react";
import { passwordRegex, usernameRegex } from "@/../backend/src/util/types";
import { useSearchParams } from "next/navigation";
import { onSignIn } from "../../authhelper";

export default function SignUp() {
    const params = useSearchParams();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [isLoggingIn, startLogIn] = useTransition();

    const tryLogIn = () => {
        if (isLoggingIn)
            return;
        startLogIn(async () => {
            const message = await onSignIn(username, password, decodeURIComponent(params.get("redirect") ?? "/"));
            // If successful, there will not be an error message
            if (message) {
                setErrorMessage(message);
            }
        });
    };

    return (
        <div className="*:my-2 [&>label]:mr-2">
            <h1>Log in</h1>
            <label>Username</label>
            <input className="text-black" type="text" pattern={usernameRegex.source} value={username} onChange={e => setUsername(e.target.value)} />
            <br/>
            <label>Password</label>
            <input className="text-black" type="password" pattern={passwordRegex.source} value={password} onChange={e => setPassword(e.target.value)} />
            <br/>
            <button onClick={tryLogIn}>Log in</button>
            <br/>
            <p className="text-red-600">{errorMessage}</p>
        </div>
    );
}