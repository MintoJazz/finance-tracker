import type { Prisma } from "@/prisma/generated/prisma/client";
import {
    civilToLocalNoon,
    civilToUtcDate,
} from "@/modules/agreements/application/services/civil-date";
import type { InstallmentScheduleItem } from "../../application/services/installment-schedule.calculator";

export interface InstallmentWriteLeg {
    balanceId: number;
    amount: number;
    direction: "DEBIT" | "CREDIT";
}

export interface InstallmentWriteEntry {
    description: string;
    type: "ACCRUAL" | "TRANSFER";
    dueDate: Date;
    competanceDate: Date;
    movements: InstallmentWriteLeg[];
}

/** Data civil gravada às 12:00 UTC, como o ledger (não vira o dia anterior em fusos negativos). */
function entryDate(civil: string): Date {
    return new Date(`${civil}T12:00:00.000Z`);
}

/**
 * Agreement finito do parcelamento: MONTHLY, da 1ª à última parcela. O valor da parcela entra como
 * `AgreementAmountEntry` (livro de deltas): o valor base na 1ª data e, se a última parcela absorveu
 * o resto da divisão, um delta na data dela.
 */
export function buildInstallmentAgreementCreate(
    schedule: InstallmentScheduleItem[]
): Prisma.AgreementCreateWithoutBalanceInput {
    const first = schedule[0];
    const last = schedule[schedule.length - 1];
    const startsAt = civilToUtcDate(first.date);
    const base = first.amount;

    const amountEntries: { amount: number; effectiveAt: Date; reason: string }[] = [
        { amount: base, effectiveAt: civilToLocalNoon(first.date), reason: "Valor da parcela" },
    ];
    if (last.amount !== base) {
        amountEntries.push({
            amount: last.amount - base,
            effectiveAt: civilToLocalNoon(last.date),
            reason: "Ajuste da última parcela (resto da divisão)",
        });
    }

    return {
        isActive: true,
        frequency: "MONTHLY",
        interval: 1,
        startsAt,
        endsAt: civilToUtcDate(last.date),
        rules: {
            create: {
                effectiveFrom: startsAt,
                dueDay: Number(first.date.slice(8, 10)),
            },
        },
        amountEntries: { create: amountEntries },
    };
}

/**
 * Lançamentos das parcelas, na ordem de gravação. Cada parcela k tem:
 *  - `ACCRUAL`: parcelamento -v (DEBIT) / subcategoria +v (CREDIT), nos dois tipos;
 *  - `TRANSFER` (só em fatura): parcelamento +v (CREDIT) / cartão -v (DEBIT): a dívida passa ao cartão.
 * Todo Entry fecha em zero; o vínculo com o parcelamento é a perna de Movement no próprio Balance.
 */
export function buildInstallmentEntries(params: {
    name: string;
    installmentId: number;
    subcategoryId: number;
    cardId: number | null;
    schedule: InstallmentScheduleItem[];
}): InstallmentWriteEntry[] {
    const { name, installmentId, subcategoryId, cardId, schedule } = params;
    const total = schedule.length;

    return schedule.flatMap((item) => {
        const description = `${name} (${item.number}/${total})`;
        const date = entryDate(item.date);
        const common = { description, dueDate: date, competanceDate: date };

        const entries: InstallmentWriteEntry[] = [
            {
                ...common,
                type: "ACCRUAL",
                movements: [
                    { balanceId: installmentId, amount: -item.amount, direction: "DEBIT" },
                    { balanceId: subcategoryId, amount: item.amount, direction: "CREDIT" },
                ],
            },
        ];

        if (cardId != null) {
            entries.push({
                ...common,
                type: "TRANSFER",
                movements: [
                    { balanceId: installmentId, amount: item.amount, direction: "CREDIT" },
                    { balanceId: cardId, amount: -item.amount, direction: "DEBIT" },
                ],
            });
        }

        return entries;
    });
}
