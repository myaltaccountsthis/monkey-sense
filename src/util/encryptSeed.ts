import Base64 from "./Base64";

const MOD = BigInt("1000000000000000003");
const PRIME = BigInt("9899999999999999941");
const PRIME_INV = inv(PRIME);

function modexp(base: bigint, pow: bigint) {
    let result = BigInt(1);
    while (pow > 0) {
        if (pow % BigInt(2) == BigInt(1))
            result = result * base % MOD;
        base = base * base % MOD;
        pow /= BigInt(2);
    }
    return result;
}

function inv(x: bigint) {
    return modexp(x, MOD - BigInt(2));
}

export function encryptSeed(seed: string) {
    const num = BigInt(Base64.decode(seed));
    return num * PRIME % MOD;
}
export function decryptSeed(encryptedNum: bigint) {
    const num = encryptedNum * PRIME_INV % MOD;
    return Base64.encode(Number(num));
}