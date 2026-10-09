/**
 * Registry de estratégias de ciclo por frequência (MONTHLY, WEEKLY, YEARLY).
 *
 * REGRAS DE DATAS:
 * - O motor trabalha estritamente com datas civis normalizadas via `startOfDay`.
 * - Nunca chama `new Date()` sem argumentos.
 */
import {
    addDays,
    addMonths,
    addWeeks,
    addYears,
    endOfMonth,
    endOfWeek,
    endOfYear,
    format,
    getDaysInMonth,
    setDate,
    startOfDay,
    startOfMonth,
    startOfWeek,
    startOfYear,
    subMonths,
} from "date-fns";
import { CycleRuleWithEntriesData } from "../types/commitment-cycle-engine.interface";

const PT_BR_MONTHS = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
];

export interface CyclePeriodBoundaries {
    cycleKey: string;
    beginsAt: Date;
    endsAt: Date;
    dueDate: Date;
    label: string;
}

export interface ICycleFrequencyStrategy {
    /**
     * Retorna a data do período base após aplicar o deslocamento de closingDay se aplicável.
     */
    resolveReferenceDate(rawRefDate: Date, rule: CycleRuleWithEntriesData): Date;

    /**
     * Calcula os limites de início, fim, vencimento, chave e rótulo para o ciclo que contém `date`.
     */
    getCycleBoundaries(
        date: Date,
        rule: CycleRuleWithEntriesData
    ): CyclePeriodBoundaries;

    /**
     * Avança `steps` ciclos a partir de `date`.
     */
    stepCycle(date: Date, steps: number, interval: number): Date;
}

/**
 * Estratégia Mensal (MONTHLY)
 */
class MonthlyCycleStrategy implements ICycleFrequencyStrategy {
    resolveReferenceDate(rawRefDate: Date, rule: CycleRuleWithEntriesData): Date {
        const civilDate = startOfDay(rawRefDate);
        if (rule.closingDay !== null && civilDate.getDate() > rule.closingDay) {
            return startOfDay(addMonths(civilDate, 1));
        }
        return civilDate;
    }

    getCycleBoundaries(
        date: Date,
        rule: CycleRuleWithEntriesData
    ): CyclePeriodBoundaries {
        const interval = Math.max(1, rule.interval || 1);
        const anchor = startOfMonth(startOfDay(rule.effectiveFrom));
        const target = startOfMonth(startOfDay(date));

        // Diferença em meses em relação à âncora
        const totalMonthsDiff =
            (target.getFullYear() - anchor.getFullYear()) * 12 +
            (target.getMonth() - anchor.getMonth());

        const blockIndex = Math.floor(totalMonthsDiff / interval);
        const blockStartMonth = startOfDay(addMonths(anchor, blockIndex * interval));
        const blockEndMonth = startOfDay(addMonths(blockStartMonth, interval - 1));

        // 1. beginsAt do primeiro mês do bloco
        let beginsAt: Date;
        if (rule.closingDay !== null) {
            // Dia seguinte ao endsAt do mês anterior ao início do bloco
            const prevMonth = startOfDay(subMonths(blockStartMonth, 1));
            const prevDaysInMonth = getDaysInMonth(prevMonth);
            const prevClosingClamped = Math.min(rule.closingDay, prevDaysInMonth);
            const prevEndsAt = startOfDay(setDate(prevMonth, prevClosingClamped));
            beginsAt = startOfDay(addDays(prevEndsAt, 1));
        } else {
            beginsAt = startOfDay(startOfMonth(blockStartMonth));
        }

        // 2. endsAt do último mês do bloco
        let endsAt: Date;
        if (rule.closingDay !== null) {
            const endDaysInMonth = getDaysInMonth(blockEndMonth);
            const closingClamped = Math.min(rule.closingDay, endDaysInMonth);
            endsAt = startOfDay(setDate(blockEndMonth, closingClamped));
        } else {
            endsAt = startOfDay(endOfMonth(blockEndMonth));
        }

        // 3. dueDate (baseado no fechamento do último mês do bloco)
        let dueMonth: Date;
        if (rule.closingDay !== null && rule.dueDay < rule.closingDay) {
            dueMonth = startOfDay(addMonths(blockEndMonth, 1));
        } else {
            dueMonth = blockEndMonth;
        }

        const dueDaysInMonth = getDaysInMonth(dueMonth);
        const dueClamped = Math.min(Math.max(1, rule.dueDay), dueDaysInMonth);
        const dueDate = startOfDay(setDate(dueMonth, dueClamped));

        // 4. cycleKey: YYYY-MM do primeiro mês do bloco
        const cycleKey = format(blockStartMonth, "yyyy-MM");

        // 5. label: Mês do bloco inicial (pt-BR capitalizado) + ano de dueDate
        const monthName = PT_BR_MONTHS[blockStartMonth.getMonth()];
        const label = `${monthName} ${dueDate.getFullYear()}`;

        return {
            cycleKey,
            beginsAt,
            endsAt,
            dueDate,
            label,
        };
    }

    stepCycle(date: Date, steps: number, interval: number): Date {
        const effectiveInterval = Math.max(1, interval || 1);
        return startOfDay(addMonths(date, steps * effectiveInterval));
    }
}

/**
 * Estratégia Semanal (WEEKLY)
 */
class WeeklyCycleStrategy implements ICycleFrequencyStrategy {
    resolveReferenceDate(rawRefDate: Date): Date {
        return startOfDay(rawRefDate);
    }

    getCycleBoundaries(
        date: Date,
        rule: CycleRuleWithEntriesData
    ): CyclePeriodBoundaries {
        const interval = Math.max(1, rule.interval || 1);
        const anchor = startOfWeek(startOfDay(rule.effectiveFrom), { weekStartsOn: 1 });
        const target = startOfWeek(startOfDay(date), { weekStartsOn: 1 });

        const msDiff = target.getTime() - anchor.getTime();
        const weeksDiff = Math.floor(msDiff / (7 * 24 * 60 * 60 * 1000));
        const blockIndex = Math.floor(weeksDiff / interval);

        const blockStartWeek = startOfDay(addWeeks(anchor, blockIndex * interval));
        const blockEndWeek = startOfDay(addWeeks(blockStartWeek, interval - 1));

        const beginsAt = startOfDay(startOfWeek(blockStartWeek, { weekStartsOn: 1 }));
        const endsAt = startOfDay(endOfWeek(blockEndWeek, { weekStartsOn: 1 }));

        // dueDay é dia da semana ISO (1 = Segunda, 7 = Domingo)
        const clampedDueDay = Math.min(Math.max(1, rule.dueDay), 7);
        const dueDate = startOfDay(addDays(beginsAt, clampedDueDay - 1));

        const cycleKey = format(blockStartWeek, "yyyy-'W'II");
        const weekNumber = format(blockStartWeek, "II");
        const label = `Semana ${weekNumber}, ${blockStartWeek.getFullYear()}`;

        return {
            cycleKey,
            beginsAt,
            endsAt,
            dueDate,
            label,
        };
    }

    stepCycle(date: Date, steps: number, interval: number): Date {
        const effectiveInterval = Math.max(1, interval || 1);
        return startOfDay(addWeeks(date, steps * effectiveInterval));
    }
}

/**
 * Estratégia Anual (YEARLY)
 */
class YearlyCycleStrategy implements ICycleFrequencyStrategy {
    resolveReferenceDate(rawRefDate: Date): Date {
        return startOfDay(rawRefDate);
    }

    getCycleBoundaries(
        date: Date,
        rule: CycleRuleWithEntriesData
    ): CyclePeriodBoundaries {
        const interval = Math.max(1, rule.interval || 1);
        const anchor = startOfYear(startOfDay(rule.effectiveFrom));
        const target = startOfYear(startOfDay(date));

        const yearsDiff = target.getFullYear() - anchor.getFullYear();
        const blockIndex = Math.floor(yearsDiff / interval);

        const blockStartYear = startOfDay(addYears(anchor, blockIndex * interval));
        const blockEndYear = startOfDay(addYears(blockStartYear, interval - 1));

        const beginsAt = startOfDay(startOfYear(blockStartYear));
        const endsAt = startOfDay(endOfYear(blockEndYear));

        // dueDate: dia dueDay (clamp) do mês da effectiveFrom no ano final do bloco
        const ruleMonth = startOfDay(rule.effectiveFrom).getMonth();
        const targetYear = blockEndYear.getFullYear();
        const dueYearDate = startOfDay(new Date(targetYear, ruleMonth, 1));
        const daysInDueMonth = getDaysInMonth(dueYearDate);
        const clampedDay = Math.min(Math.max(1, rule.dueDay), daysInDueMonth);
        const dueDate = startOfDay(new Date(targetYear, ruleMonth, clampedDay));

        const cycleKey = format(blockStartYear, "yyyy");
        const label = `Ano ${blockStartYear.getFullYear()}`;

        return {
            cycleKey,
            beginsAt,
            endsAt,
            dueDate,
            label,
        };
    }

    stepCycle(date: Date, steps: number, interval: number): Date {
        const effectiveInterval = Math.max(1, interval || 1);
        return startOfDay(addYears(date, steps * effectiveInterval));
    }
}

export class CycleEngineRegistry {
    private static readonly strategies: Record<
        "MONTHLY" | "WEEKLY" | "YEARLY",
        ICycleFrequencyStrategy
    > = {
        MONTHLY: new MonthlyCycleStrategy(),
        WEEKLY: new WeeklyCycleStrategy(),
        YEARLY: new YearlyCycleStrategy(),
    };

    static getStrategy(
        frequency: "MONTHLY" | "WEEKLY" | "YEARLY"
    ): ICycleFrequencyStrategy {
        const strategy = this.strategies[frequency];
        if (!strategy) {
            throw new Error(`Estratégia de frequência não suportada: ${frequency}`);
        }
        return strategy;
    }
}
