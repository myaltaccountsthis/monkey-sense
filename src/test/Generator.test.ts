import { describe, it } from 'node:test';
import { fail } from 'node:assert';
import { getTestQuestions } from '@/util/database';
import { randomSeed } from '@/util/Base64';
import { gameModes, testLengths } from '@/util/types';

describe("generator.ts Tests", () => {
    it("should not infinite loop", async () => {
        const timeout = setTimeout(() => fail("Timed out"), 15000);
        for (const gameMode of gameModes) {
            const testLength = testLengths[testLengths.length - 1];
            for (let i = 0; i < 1000; i++) {
                getTestQuestions(randomSeed(), gameMode, testLength).map(q => q.str);
            }
        }
        clearTimeout(timeout);
    });
});