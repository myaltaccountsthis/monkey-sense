"use server";

import { getNextTokenExpiration, isValidToken, signIn, signUp, User } from "@/util/auth";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

/** Hook that gets the authenticated user (calls cache()) */
export const useUser = cache<() => Promise<User | false>>(async () => await isSignedIn());

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

export async function onLogOut() {
    cookies().delete("token");
    redirect("/");
}

export async function isSignedIn() {
    return await isValidToken(cookies().get("token")?.value);
}

export async function redirectIfNotSignedIn(user: false | User) : Promise<User> {
    if (!user) {
        const redirectUrl = headers().get("x-current-path");
        redirect("/login" + (redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""));
    }
    return user;
}
