import {
    addDays,
    addMonths,
    format,
    getDaysInMonth,
    isAfter,
    isBefore,
    max,
    setDate,
    setMonth,
    setYear,
    startOfDay,
} from "date-fns";
import type {
    RecurrenceFrequency,
} from "../../models/schemas/recurrence-item.schema";

export interface CycleRuleData {
    dueDay: number;
    dueMonth: number | null;
    closingDay?: number | null;
    closingMonth?: number | null;
    effectiveFrom: Date;
}

export interface AmountEntryData {
    amount: number;
    effectiveAt: Date;
}

export interface CalculateNextDueDateParams {
    frequency: RecurrenceFrequency;
    interval?: number;
    dueDay: number;
    dueMonth?: number | null;
    startsAt: Date;
    endsAt?: Date | null;
    today?: Date;
}

export interface ResolveIsActiveParams {
    removedAt: Date | null;
    /** Flag de ativação manual (Agreement.isActive). Padrão: true. */
    isActive?: boolean;
    startsAt: Date;
    endsAt: Date | null;
    today?: Date;
}

export class RecurrenceScheduleCalculator {
    /**
     * Resolve o status de ativação da recorrência baseado nas datas contratuais.
     */
    static resolveIsActive(params: ResolveIsActiveParams): boolean {
        if (params.removedAt !== null || params.isActive === false) {
            return false;
        }

        const ref = startOfDay(params.today ?? new Date());
        const start = startOfDay(params.startsAt);

        if (isAfter(start, ref)) {
            return false;
        }

        if (params.endsAt) {
            const end = startOfDay(params.endsAt);
            if (isBefore(end, ref)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Identifica a regra vigente para a data informada (ou atual).
     */
    static resolveActiveRule(
        rules: CycleRuleData[],
        today: Date = new Date()
    ): CycleRuleData {
        if (rules.length === 0) {
            return {
                dueDay: 1,
                dueMonth: null,
                effectiveFrom: new Date(0),
            };
        }

        const ref = startOfDay(today);
        const validRules = rules
            .filter((r) => !isAfter(startOfDay(r.effectiveFrom), ref))
            .sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime());

        return validRules[0] ?? rules[0];
    }

    /**
     * Calcula o valor vigente somando cumulativamente as entradas de valor
     * que entraram em vigência até a data de referência.
     */
    static calculateCurrentAmount(
        amountEntries: AmountEntryData[],
        today: Date = new Date()
    ): number {
        if (amountEntries.length === 0) {
            return 0;
        }

        const ref = startOfDay(today);
        const effectiveEntries = amountEntries.filter(
            (e) => !isAfter(startOfDay(e.effectiveAt), ref)
        );

        if (effectiveEntries.length > 0) {
            const sum = effectiveEntries.reduce((acc, curr) => acc + curr.amount, 0);
            return Math.max(0, sum);
        }

        // Se todas as entradas forem futuras, usa o primeiro valor definido
        return Math.max(0, amountEntries[0].amount);
    }

    /**
     * Calcula a próxima data de vencimento a partir da data de referência.
     * Retorna a string no formato ISO YYYY-MM-DD ou null se o contrato estiver encerrado.
     */
    static calculateNextDueDate(
        params: CalculateNextDueDateParams
    ): string | null {
        const today = startOfDay(params.today ?? new Date());
        const startsAt = startOfDay(params.startsAt);
        const endsAt = params.endsAt ? startOfDay(params.endsAt) : null;

        if (endsAt && isBefore(endsAt, today)) {
            return null;
        }

        const baseDate = max([today, startsAt]);
        let nextDate: Date;

        switch (params.frequency) {
            case "WEEKLY": {
                const targetDayOfWeek = ((params.dueDay % 7) + 7) % 7;
                const currentDayOfWeek = baseDate.getDay();
                const diff = (targetDayOfWeek - currentDayOfWeek + 7) % 7;
                nextDate = addDays(baseDate, diff);
                break;
            }

            case "MONTHLY": {
                const day = Math.max(1, Math.min(31, params.dueDay));
                const currentMonthMaxDays = getDaysInMonth(baseDate);
                const candidateThisMonth = setDate(
                    baseDate,
                    Math.min(day, currentMonthMaxDays)
                );

                if (!isBefore(candidateThisMonth, baseDate)) {
                    nextDate = candidateThisMonth;
                } else {
                    const nextMonth = addMonths(baseDate, 1);
                    const nextMonthMaxDays = getDaysInMonth(nextMonth);
                    nextDate = setDate(nextMonth, Math.min(day, nextMonthMaxDays));
                }
                break;
            }

            case "YEARLY": {
                const month = Math.max(1, Math.min(12, params.dueMonth ?? 1)) - 1;
                const day = Math.max(1, Math.min(31, params.dueDay));

                let candidateYear = baseDate.getFullYear();
                let candidateDate = setDate(
                    setMonth(setYear(baseDate, candidateYear), month),
                    1
                );
                const maxDays = getDaysInMonth(candidateDate);
                candidateDate = setDate(candidateDate, Math.min(day, maxDays));

                if (isBefore(candidateDate, baseDate)) {
                    candidateYear += 1;
                    candidateDate = setDate(
                        setMonth(setYear(baseDate, candidateYear), month),
                        1
                    );
                    const nextMaxDays = getDaysInMonth(candidateDate);
                    candidateDate = setDate(candidateDate, Math.min(day, nextMaxDays));
                }

                nextDate = candidateDate;
                break;
            }
        }

        if (endsAt && isAfter(nextDate, endsAt)) {
            return null;
        }

        return format(nextDate, "yyyy-MM-dd");
    }
}
