import { it } from 'node:test';
import { strict as assert } from 'node:assert';
import { encrypt, decrypt, encryptSeed, decryptSeed } from '../../backend/src/util/encrypt';
import { isValidToken } from '../../backend/src/util/auth';
import { handleSubmit } from '../../backend/src/util/database';

it('round-trips empty, Unicode, long, and nested messages', () => {
    for (const message of ['', 'Hello, 世界 👋', 'x'.repeat(10000)]) {
        assert.equal(decrypt(encrypt(message)), message);
        assert.equal(decrypt(decrypt(encrypt(encrypt(message)))), message);
    }
    const seed = 'ABCDEFGH';
    const before = Date.now();
    const result = decryptSeed(encryptSeed(seed));
    assert.equal(result.seed, seed);
    assert.ok(result.time >= before && result.time <= Date.now());
});

it('uses a fresh IV when encrypting the same message', () => {
    const first = Buffer.from(encrypt('same message'), 'base64');
    const second = Buffer.from(encrypt('same message'), 'base64');
    assert.notDeepEqual(first.subarray(0, 12), second.subarray(0, 12));
});

it('rejects tampered IVs, authentication tags, and ciphertext', () => {
    const original = Buffer.from(encrypt('authenticated message'), 'base64');
    for (const offset of [0, 12, 28, original.length - 1]) {
        const tampered = Buffer.from(original);
        tampered[offset] ^= 1;
        assert.throws(() => decrypt(tampered.toString('base64')));
    }
});

it('rejects malformed, truncated, and unauthenticated payloads', () => {
    const original = Buffer.from(encrypt('a message long enough to test missing metadata'), 'base64');
    for (const length of [0, 11, 27, original.length - 1]) {
        assert.throws(() => decrypt(original.subarray(0, length).toString('base64')));
    }
    assert.throws(() => decrypt('invalid payload'));
    assert.throws(() => decrypt(original.subarray(28).toString('base64')));
});

it('rejects invalid tokens and test submissions without database access', async () => {
    const original = Buffer.from(encryptSeed('ABCDEFGH'), 'base64');
    original[12] ^= 1;
    const tampered = original.toString('base64');
    for (const payload of ['invalid payload', tampered]) {
        assert.equal(await isValidToken(payload), false);
        const form = new FormData();
        form.set('testLength', '10');
        form.set('mode', 'Number Sense');
        form.set('id', payload);
        for (let i = 0; i < 10; i++) form.set(`q${i}`, '');
        assert.equal(await handleSubmit(form, 0), null);
    }
});
