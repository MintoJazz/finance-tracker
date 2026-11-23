import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BaseOperationSliceSchema } from "./operation-base.schema";

const base = { custodyBalanceId: 1, amount: 10_000, dueDate: "2026-11-20", description: "Mensalidade", categoryId: 1 };
const parse = (overrides: Record<string, unknown>) => BaseOperationSliceSchema.safeParse({ ...base, ...overrides });

describe("BaseOperationSliceSchema — valor (EP e BVA)", () => {
    it("aceita um valor típico e o menor valor positivo", () => {
        assert.equal(parse({}).success, true);
        assert.equal(parse({ amount: 1 }).success, true);
    });

    it("rejeita as partições inválidas: negativo, zero, decimal e não numérico", () => {
        const expectations: [unknown, string][] = [
            [-5000, "O valor deve ser maior que zero"],
            [0, "O valor deve ser maior que zero"],
            [150.75, "O valor deve ser em centavos"],
            ["cem reais", "Informe o valor da operação"],
            [null, "Informe o valor da operação"],
        ];
        for (const [amount, message] of expectations) {
            const result = parse({ amount });
            assert.equal(result.success, false, String(amount));
            assert.equal(result.error?.issues[0].message, message, String(amount));
        }
    });

    it("fronteira inferior: -1 e 0 recusados, 1 e 2 aceitos", () => {
        assert.deepEqual([-1, 0, 1, 2].map((amount) => parse({ amount }).success), [false, false, true, true]);
    });
});

describe("BaseOperationSliceSchema — demais campos", () => {
    it("descrição: obrigatória, com espaços removidos e limite de 120 caracteres", () => {
        assert.equal(parse({ description: "   " }).success, false);
        assert.equal(parse({ description: "a".repeat(120) }).success, true);
        assert.equal(parse({ description: "a".repeat(121) }).success, false);
        assert.equal(parse({ description: "  Aluguel " }).data?.description, "Aluguel");
    });

    it("competência: aceita YYYY-MM-DD, nulo e ausente; recusa outro formato", () => {
        assert.equal(parse({ competanceDate: "2026-10-25" }).success, true);
        assert.equal(parse({ competanceDate: null }).success, true);
        assert.equal(parse({ competanceDate: "25/10/2026" }).success, false);
    });

    it("exige carteira/cartão/reserva (id positivo) e assume WALLET como tipo de custódia", () => {
        assert.equal(parse({ custodyBalanceId: 0 }).success, false);
        assert.equal(parse({}).data?.custodyType, "WALLET");
    });

    it("a data de vencimento é obrigatória", () => {
        assert.equal(parse({ dueDate: "" }).success, false);
        assert.equal(parse({ dueDate: undefined }).success, false);
    });
});

// Defeitos conhecidos: o vencimento só é checado quanto a "não vazio". O handler
// (create-direct-entry.handler.ts) converte com `new Date(...)`, então um texto inválido
// vira "Invalid Date" (erro interno ao gravar) e uma data impossível é deslocada em silêncio
// (2026-02-31 é gravado como 2026-03-03).
describe("BaseOperationSliceSchema — dueDate (defeitos conhecidos)", () => {
    it(
        "deveria recusar texto que não é data ('banana')",
        { todo: "dueDate usa apenas .min(1); não valida formato" },
        () => {
            assert.equal(parse({ dueDate: "banana" }).success, false);
        }
    );

    it(
        "deveria recusar data impossível (2026-02-31), em vez de gravá-la como 2026-03-03",
        { todo: "mesmo com o formato certo, o dia inexistente passa e é deslocado silenciosamente" },
        () => {
            assert.equal(parse({ dueDate: "2026-02-31" }).success, false);
        }
    );

    it("comprova o deslocamento silencioso feito pelo JavaScript (causa raiz do defeito)", () => {
        const stored = new Date("2026-02-31T12:00:00.000Z");
        assert.equal(stored.toISOString().slice(0, 10), "2026-03-03");
    });
});
