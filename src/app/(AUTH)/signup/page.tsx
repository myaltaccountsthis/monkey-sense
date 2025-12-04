"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import SignUp from "./SignUp";

export default function SignUpPage() {

    return (
        <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY!}>
            <SignUp />
        </GoogleReCaptchaProvider>
    );
}