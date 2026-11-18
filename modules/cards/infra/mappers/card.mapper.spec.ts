import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CardMapper, type BalanceWithCreditDetails } from "./card.mapper";

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);
const utc = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

// Datas relativas a hoje para o teste não envelhecer
const today = new Date();
const plusDays = (n: number) =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + n, 12);
const isoUtc = (n: number) => {
    const d = plusDays(n);
    return utc(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
};

function card(): BalanceWithCreditDetails {
    return {
        id: 1,
        name: "Nubank",
        createdAt: day(2026, 1, 1),
        removedAt: null,
        agreement: {
            createdAt: day(2026, 1, 1),
            rules: [
                // ordem das queries: effectiveFrom desc
                { id: 2, agreementId: 1, dueDay: 20, dueMonth: null, closingDay: 12, closingMonth: null, effectiveFrom: isoUtc(15), createdAt: today },
                { id: 1, agreementId: 1, dueDay: 10, dueMonth: null, closingDay: 3, closingMonth: null, effectiveFrom: utc("2026-01-01"), createdAt: today },
            ],
            amountEntries: [
                { id: 1, agreementId: 1, amount: 100000, effectiveAt: day(2026, 1, 1), reason: null, createdAt: today },
                { id: 2, agreementId: 1, amount: 50000, effectiveAt: plusDays(15), reason: null, createdAt: today },
            ],
        },
    } as unknown as BalanceWithCreditDetails;
}

describe("CardMapper respeita a vigência", () => {
    it("limite e ciclo ignoram ajustes com vigência futura", () => {
        const profile = CardMapper.toProfile(card(), 20000);
        assert.equal(profile.limit, 100000);
        assert.equal(profile.availableLimit, 80000);
        assert.equal(profile.closingDay, 3);
        assert.equal(profile.dueDay, 10);
    });

    it("o resumo da listagem segue a mesma regra", () => {
        const summary = CardMapper.toSummary(card(), 0);
        assert.equal(summary.limit, 100000);
        assert.equal(summary.closingDay, 3);
    });
});
