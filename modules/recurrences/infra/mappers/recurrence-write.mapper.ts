import type { CreateRecurrenceRepositoryDTO } from "../../application/interfaces/recurrence-repository.interface";

export type RecurrenceBalanceType = "PAYABLE" | "RECEIVABLE";

/** Despesa (DEBIT) é a pagar; Receita (CREDIT) é a receber. */
export function toBalanceType(
    direction: CreateRecurrenceRepositoryDTO["direction"]
): RecurrenceBalanceType {
    return direction === "CREDIT" ? "RECEIVABLE" : "PAYABLE";
}

/** "YYYY-MM-DD" -> meia-noite UTC do dia civil (colunas `@db.Date`). */
export function parseCivilDateUtc(value: string): Date {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) throw new Error(`Data inválida: ${value}`);
    return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

/** Dados do `Agreement` (com regra de ciclo e valor inicial) no formato aninhado do Prisma. */
export function buildAgreementCreate(data: CreateRecurrenceRepositoryDTO) {
    const startsAt = parseCivilDateUtc(data.startDate);
    const isYearly = data.frequency === "YEARLY";
    const hasClosing = data.hasCustomClosingDate;

    return {
        isActive: true,
        frequency: data.frequency,
        interval: 1,
        startsAt,
        endsAt: null,
        rules: {
            create: {
                effectiveFrom: startsAt,
                dueDay: data.dueDay,
                dueMonth: isYearly ? (data.dueMonth ?? null) : null,
                closingDay: hasClosing ? (data.closingDay ?? null) : null,
                closingMonth: isYearly && hasClosing ? (data.closingMonth ?? null) : null,
            },
        },
        amountEntries: {
            create: {
                amount: data.amount,
                effectiveAt: startsAt,
                reason: "Valor inicial",
            },
        },
    };
}
