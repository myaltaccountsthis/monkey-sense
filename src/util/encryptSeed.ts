import crypto from "crypto";

const algorithm = "aes-256-gcm";
const AES_KEY = Buffer.from(BigInt(process.env.AES_KEY!).toString(16), "hex");
const AES_IV = Buffer.from(BigInt(process.env.AES_IV!).toString(16), "hex");

export function encryptSeed(seed: string) {
    const cipher = crypto.createCipheriv(algorithm, AES_KEY, AES_IV);
    const json = JSON.stringify({ seed: seed, time: Date.now() });
    return cipher.update(json, "utf8", "base64") + cipher.final("base64");
}
export function decryptSeed(encrypted: string) {
    const cipher = crypto.createDecipheriv(algorithm, AES_KEY, AES_IV);
    return JSON.parse(cipher.update(encrypted, "base64", "ascii"));
}