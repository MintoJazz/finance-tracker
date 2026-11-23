import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ZodType } from "zod";
import { AmountAdjustmentDetailsSchema } from "@/modules/agreements/models/amount-adjustment.schema";
import { CardFormSchema } from "@/modules/cards/models/card.schema";
import { InstallmentFormBaseSchema } from "@/modules/installments/models/schemas/installment-form.schema";
import { RecurrenceFormBaseSchema } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import { BaseOperationSliceSchema } from "./operation-base.schema";

/**
 * Valores monetários são gravados em colunas `Int` do PostgreSQL (32 bits com sinal).
 * Um valor acima de 2³¹ − 1 passa pela validação de entrada, mas faz o Prisma
 * lançar P2020 ("Value out of range") na gravação. Cada campo abaixo deveria
 * recusar o valor já no schema, com mensagem amigável.
 *
 * Análise de valor limite (BVA, 2 valores por fronteira):
 *   INT32_MAX − 1 e INT32_MAX  -> válidos (devem passar hoje)
 *   INT32_MAX + 1              -> inválido (DEFEITO: hoje é aceito)
 */
const INT32_MAX = 2_147_483_647;

const fields: { name: string; column: string; schema: ZodType }[] = [
    { name: "operação (amount)", column: "Movement.amount", schema: BaseOperationSliceSchema.shape.amount },
    { name: "limite do cartão (limit)", column: "AgreementAmountEntry.amount", schema: CardFormSchema.shape.limit },
    { name: "ajuste de valor (amount)", column: "AgreementAmountEntry.amount", schema: AmountAdjustmentDetailsSchema.shape.amount },
    { name: "recorrência (amount)", column: "AgreementAmountEntry.amount", schema: RecurrenceFormBaseSchema.shape.amount },
    { name: "parcelamento (totalAmount)", column: "Movement.amount", schema: InstallmentFormBaseSchema.shape.totalAmount },
];

describe("Valores monetários x coluna Int de 32 bits (BVA no limite superior)", () => {
    for (const { name, column, schema } of fields) {
        describe(`${name} -> ${column}`, () => {
            it("aceita INT32_MAX − 1 e INT32_MAX (fronteira interna)", () => {
                assert.equal(schema.safeParse(INT32_MAX - 1).success, true);
                assert.equal(schema.safeParse(INT32_MAX).success, true);
            });

            it(
                "deveria recusar INT32_MAX + 1 (fronteira externa)",
                { todo: `${name}: schema sem .max(2_147_483_647) deixa o erro estourar no banco (Prisma P2020)` },
                () => {
                    assert.equal(schema.safeParse(INT32_MAX + 1).success, false);
                }
            );

            it(
                "deveria recusar um valor de R$ 25.000.000,00 (2.500.000.000 centavos)",
                { todo: `${name}: valor realista de alto montante é aprovado pela validação` },
                () => {
                    assert.equal(schema.safeParse(2_500_000_000).success, false);
                }
            );
        });
    }
});
