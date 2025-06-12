"use server";

import { getNextTokenExpiration, isValidToken, signIn, signUp } from "@/util/auth";
import { encrypt } from "@/util/encrypt";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { User } from "@/util/types";

/** Hook that gets the authenticated user (calls cache()) */
// export const useUser = cache<() => Promise<User | false>>(async () => await isSignedIn());
export const getUser = async () => await isSignedIn();

export async function onSignUp(username: string, password: string, captcha: string, redirectUrl: string) : Promise<string> {
    const result = await signUp(username, password, captcha);
    if (result.success) {
        cookies().set("token", result.message, {
            httpOnly: true,
            secure: true,
            expires: getNextTokenExpiration()
        });
        redirect(redirectUrl);
    }
    return result.message;
}

export async function onSignIn(username: string, password: string, redirectUrl: string) : Promise<string> {
    const result = await signIn(username, password);
    if (result.success) {
        cookies().set("token", result.message, {
            httpOnly: true,
            secure: true,
            expires: getNextTokenExpiration()
        });
        redirect(redirectUrl);
    }
    return result.message;
}

export async function onLogOut(redirectUrl: string) {
    cookies().delete("token");
    redirect(redirectUrl);
}

export async function getTokenCookie() {
    return cookies().get("token")?.value;
}

export async function isSignedIn() {
    const cookie = await getTokenCookie();
    const result = await isValidToken(cookie);
    // if (cookie && !result)
        // cookies().delete("token");
    return result;
}

export async function getSecureToken() {
    const token = await getTokenCookie();
    return token ? encrypt(token) : undefined;
}

export async function redirectIfNotSignedIn(user: false | User) : Promise<User> {
    if (!user) {
        const redirectUrl = headers().get("x-current-path");
        redirect(`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`);
    }
    return user;
}
