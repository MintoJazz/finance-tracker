import {
    addMonths,
    addQuarters,
    addYears,
    endOfMonth,
    endOfQuarter,
    endOfYear,
    startOfMonth,
    startOfQuarter,
    startOfYear,
} from "date-fns";
import { CycleFrequency } from "@/prisma/generated/prisma/client";

export interface CalculateHorizonParams {
    frequency: CycleFrequency;
    today: Date;
    /** Deslocamento de blocos (0 = atual, -1 = anterior, +1 = próximo) */
    offset?: number;
    /** Modo de janela: 'CALENDAR_YEAR' (Jan..Dez) ou 'ROLLING' (centrado no hoje/fatura atual) */
    mode?: "CALENDAR_YEAR" | "CALENDAR_QUARTER" | "ROLLING";
}

export class CycleHorizonCalculator {
    /**
     * Calcula o horizonte [from, to] em O(1) a partir da frequência e do deslocamento (offset).
     */
    static calculate(params: CalculateHorizonParams): { from: Date; to: Date } {
        const {
            frequency,
            today,
            offset = 0,
            mode = "CALENDAR_YEAR",
        } = params;

        if (frequency === "YEARLY") {
            // Blocos de 10 anos
            const shiftedDate = addYears(today, offset * 10);
            return {
                from: startOfYear(shiftedDate),
                to: endOfYear(addYears(shiftedDate, 9)),
            };
        }

        if (mode === "CALENDAR_QUARTER") {
            // Trimestres fixos do calendário: jan–mar, abr–jun, jul–set, out–dez
            const targetQuarterDate = addQuarters(today, offset);
            return {
                from: startOfQuarter(targetQuarterDate),
                to: endOfQuarter(targetQuarterDate),
            };
        }

        if (mode === "ROLLING") {
            // Bloco deslizante de 12 meses (ex: offset 0 = -2 meses até +9 meses; offset +1 = +10 a +21 meses)
            const baseStart = addMonths(startOfMonth(today), offset * 12 - 2);
            const baseEnd = endOfMonth(addMonths(baseStart, 11));
            return {
                from: baseStart,
                to: baseEnd,
            };
        }

        // Padrão (CALENDAR_YEAR): Bloco de 1 ano civil deslocado pelo offset (ex: 2026 + offset)
        const targetYearDate = addYears(today, offset);
        return {
            from: startOfYear(targetYearDate),
            to: endOfYear(targetYearDate),
        };
    }
}