"use client";

import { useCallback, useState, useTransition } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { passwordRegex, usernameRegex } from "@/util/types";
import { onSignUp } from "../authhelper";
import { useSearchParams } from "next/navigation";

export default function SignUp() {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const params = useSearchParams();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [isSigningUp, startSignUp] = useTransition();
    const [isExecutingRecaptcha, startExecutingRecaptcha] = useTransition();

    const handleRecaptcha = useCallback(async () => {
        if (!executeRecaptcha) {
            return;
        }
        if (isExecutingRecaptcha)
            return;
        startExecutingRecaptcha(() => executeRecaptcha("signup").then(setCaptchaToken));
        console.log(process.env);
    }, [executeRecaptcha]);

    const trySignUp = () => {
        if (isSigningUp)
            return;
        startSignUp(async () => {
            const message = await onSignUp(username, password, captchaToken, decodeURIComponent(params.get("redirect") ?? "/"));
            // If successful, there will not be an error message
            if (message) {
                setErrorMessage(message);
                setCaptchaToken("");
            }
        });
    };

    return (
        <div className="*:my-2 [&>label]:mr-2">
            <h1>Sign Up</h1>
            <label>Username</label>
            <input className="text-black" type="text" pattern={usernameRegex.source} value={username} onChange={e => setUsername(e.target.value)} />
            <br/>
            <label>Password</label>
            <input className="text-black" type="password" pattern={passwordRegex.source} value={password} onChange={e => setPassword(e.target.value)} />
            <br/>
            <label>{ isExecutingRecaptcha ? "⏳" : captchaToken ? "✅" : "👉" }</label>
            <button onClick={handleRecaptcha}>I&apos;m not a robot</button>
            <br/>
            <button onClick={trySignUp}>Sign Up</button>
            <br/>
            <p className="text-red-600">{errorMessage}</p>
            <div className="[&>a]:text-blue-400 text-xs w-full absolute bottom-0">
                This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy">Privacy Policy</a> and <a href="https://policies.google.com/terms">Terms of Service</a> apply.
            </div>
        </div>
    );
}