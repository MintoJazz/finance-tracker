import { getDaysInMonth } from "date-fns";
import {
    civilToLocalNoon,
    toCivilString,
} from "@/modules/agreements/application/services/civil-date";
import { InstallmentDomainError } from "../policies/installment.policy";

export interface MonthlyDueDayAdjustmentInput {
    nextDueDate: string | null;
    endsAt: string | null;
    openCount: number;
    newDueDay: number;
}

export interface InstallmentDeadlinesPreview {
    affectedCount: number;
    previousNextDueDate: string | null;
    newNextDueDate: string | null;
    previousEndsAt: string | null;
    newEndsAt: string | null;
}

/** Aplica um dia civil (1..31) preservando ano/mês, com clamp ao último dia do mês (ex.: 31 -> 28/fev). */
export function applyDueDayToCivilDate(dateStr: string, dueDay: number): string {
    const date = civilToLocalNoon(dateStr);
    const maxDay = getDaysInMonth(date);
    const clampedDay = Math.min(dueDay, maxDay);
    return toCivilString(new Date(date.getFullYear(), date.getMonth(), clampedDay, 12));
}

/**
 * Fluxo exclusivo de Prazos — Mês a Mês: recalcula o próximo vencimento e a data final
 * das parcelas em aberto para o novo dia de vencimento, sem alterar valores nem quantidade.
 */
export function planMonthlyDueDayAdjustment(
    input: MonthlyDueDayAdjustmentInput
): InstallmentDeadlinesPreview {
    if (!Number.isInteger(input.newDueDay) || input.newDueDay < 1 || input.newDueDay > 31) {
        throw new InstallmentDomainError(
            "O dia de vencimento deve estar entre 1 e 31.",
            "INVALID_DUE_DAY"
        );
    }

    return {
        affectedCount: Math.max(0, input.openCount),
        previousNextDueDate: input.nextDueDate,
        newNextDueDate: input.nextDueDate
            ? applyDueDayToCivilDate(input.nextDueDate, input.newDueDay)
            : null,
        previousEndsAt: input.endsAt,
        newEndsAt: input.endsAt
            ? applyDueDayToCivilDate(input.endsAt, input.newDueDay)
            : null,
    };
}
