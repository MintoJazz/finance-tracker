import {
    addDays,
    addMonths,
    addWeeks,
    addYears,
    differenceInCalendarMonths,
    differenceInCalendarWeeks,
    differenceInCalendarYears,
    endOfMonth,
    format,
    getDaysInMonth,
    isAfter,
    isBefore,
    setDate,
    setDay,
    setMonth,
    startOfDay,
    startOfMonth,
    subMonths,
    subYears,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CycleFrequency } from "@/prisma/generated/prisma/client";

export interface AgreementScheduleContext {
    frequency: CycleFrequency;
    interval: number;
    startsAt: Date;
    endsAt: Date | null;
}

export interface CycleRuleRecord {
    id: number;
    agreementId: number;
    dueDay: number;
    dueMonth: number | null;
    closingDay: number | null;
    closingMonth: number | null;
    effectiveFrom: Date;
}

export interface RawCycleGeometry {
    beginsAt: Date;
    endsAt: Date;
    closingDate: Date | null;
    dueDate: Date;
    label: string;
}

export interface ICycleFrequencyStrategy {
    /**
     * Resolve a geometria canônica do ciclo que contém a data `cursor`.
     */
    resolveGeometryForDate(
        cursor: Date,
        agreement: AgreementScheduleContext,
        rule: CycleRuleRecord
    ): RawCycleGeometry;

    /**
     * Desloca uma data âncora em `steps` ciclos (positivos ou negativos).
     */
    stepDate(
        anchor: Date,
        steps: number,
        interval: number
    ): Date;
}

/**
 * Ajusta o dia para não estourar o último dia do mês (ex: dia 31 em fevereiro -> 28/29).
 */
function clampDayOfMonth(yearMonthDate: Date, targetDay: number): Date {
    const maxDay = getDaysInMonth(yearMonthDate);
    return startOfDay(setDate(yearMonthDate, Math.min(Math.max(1, targetDay), maxDay)));
}

/**
 * Capitaliza a primeira letra do label formatado (ex: "novembro 2026" -> "Novembro 2026").
 */
function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

// ============================================================================
// 1. ONCE (Pontual)
// ============================================================================
const OnceCycleStrategy: ICycleFrequencyStrategy = {
    resolveGeometryForDate(_cursor, agreement, rule) {
        const beginsAt = startOfDay(agreement.startsAt);
        const endsAt = startOfDay(agreement.endsAt ?? agreement.startsAt);

        // Na frequência ONCE, se endsAt existir no acordo, usamos como referência;
        // caso contrário, projetamos o dueDay no mês de startsAt.
        const dueDate = agreement.endsAt
            ? startOfDay(agreement.endsAt)
            : clampDayOfMonth(beginsAt, rule.dueDay);

        const closingDate =
            rule.closingDay !== null
                ? clampDayOfMonth(beginsAt, rule.closingDay)
                : null;

        return {
            beginsAt,
            endsAt,
            closingDate,
            dueDate,
            label: format(dueDate, "dd/MM/yyyy"),
        };
    },

    stepDate(anchor) {
        return startOfDay(anchor);
    },
};

// ============================================================================
// 2. WEEKLY (Semanal / Quinzenal via interval)
// ============================================================================
const WeeklyCycleStrategy: ICycleFrequencyStrategy = {
    resolveGeometryForDate(cursor, agreement, rule) {
        const normalizedCursor = startOfDay(cursor);
        const interval = Math.max(1, agreement.interval);

        // closingDay/dueDay representam o dia da semana (0 = Dom .. 6 = Sáb)
        const targetClosingDow = (rule.closingDay ?? rule.dueDay) % 7;
        const targetDueDow = rule.dueDay % 7;

        // Encontra o fechamento da semana atual ou subsequente respeitando o intervalo desde effectiveFrom
        const weeksDiff = differenceInCalendarWeeks(
            normalizedCursor,
            startOfDay(rule.effectiveFrom),
            { weekStartsOn: 0 }
        );
        const alignedWeeks =
            weeksDiff >= 0
                ? Math.floor(weeksDiff / interval) * interval
                : Math.ceil(weeksDiff / interval) * interval;

        const baseWeekDate = addWeeks(startOfDay(rule.effectiveFrom), alignedWeeks);
        let endsAt = startOfDay(setDay(baseWeekDate, targetClosingDow, { weekStartsOn: 0 }));

        if (isBefore(endsAt, normalizedCursor)) {
            endsAt = addWeeks(endsAt, interval);
        }

        const beginsAt = addDays( addWeeks(endsAt, -interval), 1 );
        while (isAfter(beginsAt, normalizedCursor)) {
            endsAt = addWeeks(endsAt, -interval);
        }

        const finalBeginsAt = addDays(addWeeks(endsAt, -interval), 1);
        const closingDate = rule.closingDay !== null ? endsAt : null;

        // Se o dia de vencimento na semana for menor que o de fechamento, vence na semana seguinte
        let dueDate = startOfDay(setDay(endsAt, targetDueDow, { weekStartsOn: 0 }));
        if (isBefore(dueDate, endsAt)) {
            dueDate = addWeeks(dueDate, 1);
        }

        return {
            beginsAt: finalBeginsAt,
            endsAt,
            closingDate,
            dueDate,
            label: `${format(finalBeginsAt, "dd/MM")} - ${format(endsAt, "dd/MM/yyyy")}`,
        };
    },

    stepDate(anchor, steps, interval) {
        return addWeeks(startOfDay(anchor), steps * Math.max(1, interval));
    },
};

// ============================================================================
// 3. MONTHLY (Mensal / Bimestral / Trimestral via interval)
// ============================================================================
const MonthlyCycleStrategy: ICycleFrequencyStrategy = {
    resolveGeometryForDate(cursor, agreement, rule) {
        const normalizedCursor = startOfDay(cursor);
        const interval = Math.max(1, agreement.interval);

        // Alinha o mês com base no intervalo a partir de effectiveFrom
        const monthsDiff = differenceInCalendarMonths(
            normalizedCursor,
            startOfDay(rule.effectiveFrom)
        );
        const alignedMonths =
            monthsDiff >= 0
                ? Math.floor(monthsDiff / interval) * interval
                : Math.ceil(monthsDiff / interval) * interval;

        let referenceMonth = addMonths(startOfMonth(rule.effectiveFrom), alignedMonths);

        const buildBoundsForMonth = (monthAnchor: Date) => {
            if (rule.closingDay === null) {
                const beginsAt = startOfMonth(monthAnchor);
                const endsAt = startOfDay(endOfMonth(addMonths(monthAnchor, interval - 1)));
                const dueDate = clampDayOfMonth(endsAt, rule.dueDay);
                return { beginsAt, endsAt, closingDate: null, dueDate };
            }

            const closingMonthAnchor = addMonths(monthAnchor, interval - 1);
            const endsAt = clampDayOfMonth(closingMonthAnchor, rule.closingDay);
            const prevClosingEnd = clampDayOfMonth(
                subMonths(closingMonthAnchor, interval),
                rule.closingDay
            );
            const beginsAt = addDays(prevClosingEnd, 1);

            // Se dueDay <= closingDay, o vencimento cai no mês seguinte ao fechamento
            const dueMonthAnchor =
                rule.dueDay <= rule.closingDay
                    ? addMonths(closingMonthAnchor, 1)
                    : closingMonthAnchor;
            const dueDate = clampDayOfMonth(dueMonthAnchor, rule.dueDay);

            return { beginsAt, endsAt, closingDate: endsAt, dueDate };
        };

        let bounds = buildBoundsForMonth(referenceMonth);

        if (isAfter(normalizedCursor, bounds.endsAt)) {
            referenceMonth = addMonths(referenceMonth, interval);
            bounds = buildBoundsForMonth(referenceMonth);
        } else if (isBefore(normalizedCursor, bounds.beginsAt)) {
            referenceMonth = subMonths(referenceMonth, interval);
            bounds = buildBoundsForMonth(referenceMonth);
        }

        return {
            ...bounds,
            label: capitalize(format(bounds.dueDate, "MMMM yyyy", { locale: ptBR })),
        };
    },

    stepDate(anchor, steps, interval) {
        return addMonths(startOfDay(anchor), steps * Math.max(1, interval));
    },
};

// ============================================================================
// 4. YEARLY (Anual / Multi-anual via interval)
// ============================================================================
const YearlyCycleStrategy: ICycleFrequencyStrategy = {
    resolveGeometryForDate(cursor, agreement, rule) {
        const normalizedCursor = startOfDay(cursor);
        const interval = Math.max(1, agreement.interval);

        const closingMonthIndex = ((rule.closingMonth ?? rule.dueMonth ?? 12) - 1 + 12) % 12;
        const dueMonthIndex = ((rule.dueMonth ?? rule.closingMonth ?? 12) - 1 + 12) % 12;
        const closingDay = rule.closingDay ?? rule.dueDay;

        const yearsDiff = differenceInCalendarYears(
            normalizedCursor,
            startOfDay(rule.effectiveFrom)
        );
        const alignedYears =
            yearsDiff >= 0
                ? Math.floor(yearsDiff / interval) * interval
                : Math.ceil(yearsDiff / interval) * interval;

        let referenceYearDate = addYears(startOfDay(rule.effectiveFrom), alignedYears);

        const buildBoundsForYear = (yearAnchor: Date) => {
            const closingYearMonth = setMonth(yearAnchor, closingMonthIndex);
            const endsAt = clampDayOfMonth(closingYearMonth, closingDay);

            const prevEndsAt = clampDayOfMonth(
                subYears(closingYearMonth, interval),
                closingDay
            );
            const beginsAt = addDays(prevEndsAt, 1);

            // Se o mês/dia de vencimento for anterior ao fechamento no calendário, vence no ano seguinte
            let dueYearMonth = setMonth(yearAnchor, dueMonthIndex);
            let dueDate = clampDayOfMonth(dueYearMonth, rule.dueDay);
            if (isBefore(dueDate, endsAt)) {
                dueYearMonth = setMonth(addYears(yearAnchor, 1), dueMonthIndex);
                dueDate = clampDayOfMonth(dueYearMonth, rule.dueDay);
            }

            return {
                beginsAt,
                endsAt,
                closingDate: rule.closingDay !== null ? endsAt : null,
                dueDate,
            };
        };

        let bounds = buildBoundsForYear(referenceYearDate);

        if (isAfter(normalizedCursor, bounds.endsAt)) {
            referenceYearDate = addYears(referenceYearDate, interval);
            bounds = buildBoundsForYear(referenceYearDate);
        } else if (isBefore(normalizedCursor, bounds.beginsAt)) {
            referenceYearDate = subYears(referenceYearDate, interval);
            bounds = buildBoundsForYear(referenceYearDate);
        }

        return {
            ...bounds,
            label: format(bounds.dueDate, "yyyy"),
        };
    },

    stepDate(anchor, steps, interval) {
        return addYears(startOfDay(anchor), steps * Math.max(1, interval));
    },
};

// ============================================================================
// REGISTRY O(1) POR FREQUÊNCIA
// ============================================================================
export const CYCLE_ENGINE_REGISTRY: Record<CycleFrequency, ICycleFrequencyStrategy> = {
    ONCE: OnceCycleStrategy,
    WEEKLY: WeeklyCycleStrategy,
    MONTHLY: MonthlyCycleStrategy,
    YEARLY: YearlyCycleStrategy,
};

export class CycleEngineRegistry {
    static getStrategy(frequency: CycleFrequency): ICycleFrequencyStrategy {
        return CYCLE_ENGINE_REGISTRY[frequency];
    }
}