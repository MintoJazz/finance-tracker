import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CycleWindowEngine } from "./cycle-window.engine";

const rule = {
    id: 1,
    agreementId: 1,
    dueDay: 5,
    dueMonth: null,
    closingDay: null,
    closingMonth: null,
    effectiveFrom: new Date(2000, 0, 1),
};
const weekly = { frequency: "WEEKLY" as const, interval: 1, startsAt: new Date(2000, 0, 1), endsAt: null };

const generate = (years: number) =>
    CycleWindowEngine.generateWindows({
        agreement: weekly,
        rules: [rule],
        window: { from: new Date(2000, 0, 1), to: new Date(2000 + years - 1, 11, 31) },
    });

describe("CycleWindowEngine — limite de iterações (500)", () => {
    it("uma janela de 1 ano semanal retorna todos os ciclos (cerca de 52)", () => {
        const windows = generate(1);
        assert.ok(windows.length >= 52 && windows.length <= 54, `gerou ${windows.length}`);
    });

    it("a trava contra laço infinito limita a geração a 500 janelas", () => {
        assert.equal(generate(21).length, 500);
    });

    // Defeito conhecido: o guardrail MAX_ITERATIONS = 500 corta o resultado sem sinalizar.
    // Um horizonte semanal de ~10 anos já estoura; o chamador recebe uma lista incompleta e
    // nenhum erro. 21 anos deveriam gerar cerca de 1.090 ciclos.
    it(
        "uma janela semanal de 21 anos deveria gerar todos os ciclos, ou sinalizar o corte",
        { todo: "MAX_ITERATIONS trunca silenciosamente: a lista termina em 2009 para uma janela até 2020" },
        () => {
            assert.ok(generate(21).length > 1000);
        }
    );
});
