import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { TestOptions, TestResults } from "./types";

const sessionOptions: SessionOptions = {
    password: "FnRZ,YM@Zo$ZI0KBHe/E4.e1,wn4X1sf^g7U+ugvG}]-'kk$$&w8E(cMo4i9~?`@",
    cookieName: "monkeySession",
    cookieOptions: {
        secure: true
    }
};

export interface SessionData {
    testOptions: TestOptions;
    testStart: number;
    testResults: TestResults | null;
};