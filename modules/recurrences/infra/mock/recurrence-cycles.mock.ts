import {
    addDays,
    addQuarters,
    addYears,
    differenceInCalendarDays,
    endOfMonth,
    format,
    getQuarter,
    getYear,
    isAfter,
    parseISO,
    startOfMonth,
    startOfQuarter,
    subDays,
} from "date-fns";
import { formatDate } from "@/lib/formatters";
import type { CycleItem } from "@/modules/cycles/models/cycle-item.schema";
import type {
    MacroHorizonInfo,
    RecurrenceCycleFilters,
    RecurrenceCyclesResult,
} from "../../models/schemas/recurrence-cycle-filters.schema";
import type {
    RecurrenceFrequency,
    RecurrenceListItem,
} from "../../models/schemas/recurrence-item.schema";

const MONTH_NAMES = [
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

export function generateMockRecurrenceCycles(
    recurrence: RecurrenceListItem,
    filters: RecurrenceCycleFilters,
    today: Date = new Date()
): RecurrenceCyclesResult {
    const { offset = 0, status = "ALL", includeProjected = true, from, to } = filters;
    const frequency: RecurrenceFrequency = recurrence.frequency;
    const currentYear = getYear(today);

    let horizon: MacroHorizonInfo;
    const rawCycles: CycleItem[] = [];

    // Modo 1: Filtro de período customizado (from e to)
    if (from && to) {
        const fromDate = parseISO(from);
        const toDate = parseISO(to);
        const diffDays = Math.max(1, differenceInCalendarDays(toDate, fromDate) + 1);

        horizon = {
            label: `${formatDate(fromDate)} – ${formatDate(toDate)}`,
            offset,
            canPrev: true,
            canNext: true,
            prevOffset: offset - 1,
            nextOffset: offset + 1,
            from,
            to,
            isCustom: true,
        };

        if (frequency === "YEARLY") {
            const startYear = getYear(fromDate);
            const endYear = getYear(toDate);

            for (let y = startYear; y <= endYear; y++) {
                const dueDay = Math.min(Math.max(recurrence.dueDay, 1), 28);
                const dueMonth = recurrence.dueMonth ?? 1;
                const dueMonthPadded = String(dueMonth).padStart(2, "0");
                const dueDayPadded = String(dueDay).padStart(2, "0");
                const dueDateStr = `${y}-${dueMonthPadded}-${dueDayPadded}`;

                const fromStr = `${y}-01-01`;
                const toStr = `${y}-12-31`;

                let cycleStatus: CycleItem["status"];
                let paidAmount = 0;
                let remainingAmount = recurrence.currentAmount;

                if (y < currentYear) {
                    cycleStatus = "PAID";
                    paidAmount = recurrence.currentAmount;
                    remainingAmount = 0;
                } else if (y === currentYear) {
                    cycleStatus = recurrence.isOverdue ? "OVERDUE" : "PENDING";
                } else {
                    cycleStatus = "PROJECTED";
                }

                rawCycles.push({
                    balanceId: recurrence.balanceId,
                    from: fromStr,
                    to: toStr,
                    dueDate: dueDateStr,
                    label: `Exercício ${y}`,
                    status: cycleStatus,
                    totalAmount: recurrence.currentAmount,
                    paidAmount,
                    remainingAmount,
                    isOverdue: cycleStatus === "OVERDUE",
                    movementsCount: cycleStatus === "PROJECTED" ? 0 : 1,
                    settlementDate: cycleStatus === "PAID" ? `${y}-01-15` : null,
                    referenceDate: fromStr,
                });
            }
        } else if (frequency === "WEEKLY") {
            let cursor = fromDate;
            let weekIndex = 1;

            while (!isAfter(cursor, toDate)) {
                const weekStart = cursor;
                const weekEnd = addDays(weekStart, 6);
                const fromStr = format(weekStart, "yyyy-MM-dd");
                const toStr = format(weekEnd, "yyyy-MM-dd");

                const dueOffsetDays = Math.min(Math.max(recurrence.dueDay, 0), 6);
                const dueDate = addDays(weekStart, dueOffsetDays);
                const dueDateStr = format(dueDate, "yyyy-MM-dd");

                let cycleStatus: CycleItem["status"];
                let paidAmount = 0;
                let remainingAmount = recurrence.currentAmount;

                if (dueDate < today) {
                    if (weekIndex % 4 === 0 && recurrence.isOverdue) {
                        cycleStatus = "OVERDUE";
                    } else {
                        cycleStatus = "PAID";
                        paidAmount = recurrence.currentAmount;
                        remainingAmount = 0;
                    }
                } else if (format(dueDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
                    cycleStatus = "OPEN";
                } else {
                    cycleStatus = "PROJECTED";
                }

                rawCycles.push({
                    balanceId: recurrence.balanceId,
                    from: fromStr,
                    to: toStr,
                    dueDate: dueDateStr,
                    label: `Semana ${weekIndex} • ${format(weekStart, "dd/MM")} a ${format(weekEnd, "dd/MM")}`,
                    status: cycleStatus,
                    totalAmount: recurrence.currentAmount,
                    paidAmount,
                    remainingAmount,
                    isOverdue: cycleStatus === "OVERDUE",
                    movementsCount: cycleStatus === "PROJECTED" ? 0 : 1,
                    settlementDate: cycleStatus === "PAID" ? dueDateStr : null,
                    referenceDate: fromStr,
                });

                cursor = addDays(cursor, 7);
                weekIndex++;
            }
        } else {
            // MONTHLY
            let cursor = startOfMonth(fromDate);
            const finalMonth = endOfMonth(toDate);

            while (!isAfter(cursor, finalMonth)) {
                const m = cursor.getMonth();
                const targetYear = cursor.getFullYear();
                const monthStart = startOfMonth(cursor);
                const monthEnd = endOfMonth(cursor);

                const fromStr = format(monthStart, "yyyy-MM-dd");
                const toStr = format(monthEnd, "yyyy-MM-dd");

                const maxDaysInMonth = monthEnd.getDate();
                const safeDueDay = Math.min(Math.max(recurrence.dueDay, 1), maxDaysInMonth);
                const dueDate = new Date(targetYear, m, safeDueDay);
                const dueDateStr = format(dueDate, "yyyy-MM-dd");

                let cycleStatus: CycleItem["status"];
                let paidAmount = 0;
                let remainingAmount = recurrence.currentAmount;

                const currentMonthIdx = today.getMonth();

                if (targetYear < currentYear || (targetYear === currentYear && m < currentMonthIdx)) {
                    if (m === currentMonthIdx - 1 && recurrence.isOverdue) {
                        cycleStatus = "OVERDUE";
                    } else {
                        cycleStatus = "PAID";
                        paidAmount = recurrence.currentAmount;
                        remainingAmount = 0;
                    }
                } else if (targetYear === currentYear && m === currentMonthIdx) {
                    cycleStatus = recurrence.isOverdue ? "OVERDUE" : "PENDING";
                } else {
                    cycleStatus = "PROJECTED";
                }

                rawCycles.push({
                    balanceId: recurrence.balanceId,
                    from: fromStr,
                    to: toStr,
                    dueDate: dueDateStr,
                    label: `${MONTH_NAMES[m]} ${targetYear}`,
                    status: cycleStatus,
                    totalAmount: recurrence.currentAmount,
                    paidAmount,
                    remainingAmount,
                    isOverdue: cycleStatus === "OVERDUE",
                    movementsCount: cycleStatus === "PROJECTED" ? 0 : 1,
                    settlementDate: cycleStatus === "PAID" ? `${targetYear}-${String(m + 1).padStart(2, "0")}-05` : null,
                    referenceDate: fromStr,
                });

                cursor = addDays(monthEnd, 1);
            }
        }
    } else if (frequency === "YEARLY") {
        // Modo 2 Padrão: Bloco de 10 anos (década)
        const baseDecadeStart = Math.floor(currentYear / 10) * 10 + offset * 10;
        const baseDecadeEnd = baseDecadeStart + 9;

        horizon = {
            label: `${baseDecadeStart} – ${baseDecadeEnd}`,
            offset,
            canPrev: true,
            canNext: true,
            prevOffset: offset - 1,
            nextOffset: offset + 1,
            isCustom: false,
        };

        for (let y = baseDecadeStart; y <= baseDecadeEnd; y++) {
            const dueDay = Math.min(Math.max(recurrence.dueDay, 1), 28);
            const dueMonth = recurrence.dueMonth ?? 1;
            const dueMonthPadded = String(dueMonth).padStart(2, "0");
            const dueDayPadded = String(dueDay).padStart(2, "0");
            const dueDateStr = `${y}-${dueMonthPadded}-${dueDayPadded}`;

            const fromStr = `${y}-01-01`;
            const toStr = `${y}-12-31`;

            let cycleStatus: CycleItem["status"];
            let paidAmount = 0;
            let remainingAmount = recurrence.currentAmount;

            if (y < currentYear) {
                cycleStatus = "PAID";
                paidAmount = recurrence.currentAmount;
                remainingAmount = 0;
            } else if (y === currentYear) {
                if (recurrence.isOverdue) {
                    cycleStatus = "OVERDUE";
                } else {
                    cycleStatus = "PENDING";
                }
            } else {
                cycleStatus = "PROJECTED";
            }

            rawCycles.push({
                balanceId: recurrence.balanceId,
                from: fromStr,
                to: toStr,
                dueDate: dueDateStr,
                label: `Exercício ${y}`,
                status: cycleStatus,
                totalAmount: recurrence.currentAmount,
                paidAmount,
                remainingAmount,
                isOverdue: cycleStatus === "OVERDUE",
                movementsCount: cycleStatus === "PROJECTED" ? 0 : 1,
                settlementDate: cycleStatus === "PAID" ? `${y}-01-15` : null,
                referenceDate: fromStr,
            });
        }
    } else if (frequency === "WEEKLY") {
        // Bloco de 1 Trimestre (quarter)
        const targetDate = addQuarters(today, offset);
        const quarterNum = getQuarter(targetDate);
        const quarterYear = getYear(targetDate);
        const quarterStart = startOfQuarter(targetDate);

        horizon = {
            label: `${quarterNum}º Trimestre ${quarterYear}`,
            offset,
            canPrev: true,
            canNext: true,
            prevOffset: offset - 1,
            nextOffset: offset + 1,
            isCustom: false,
        };

        // 13 semanas em um trimestre
        for (let w = 0; w < 13; w++) {
            const weekStart = addDays(quarterStart, w * 7);
            const weekEnd = addDays(weekStart, 6);
            const fromStr = format(weekStart, "yyyy-MM-dd");
            const toStr = format(weekEnd, "yyyy-MM-dd");

            const dueOffsetDays = Math.min(Math.max(recurrence.dueDay, 0), 6);
            const dueDate = addDays(weekStart, dueOffsetDays);
            const dueDateStr = format(dueDate, "yyyy-MM-dd");

            let cycleStatus: CycleItem["status"];
            let paidAmount = 0;
            let remainingAmount = recurrence.currentAmount;

            if (dueDate < today) {
                if (w % 4 === 0 && recurrence.isOverdue) {
                    cycleStatus = "OVERDUE";
                } else {
                    cycleStatus = "PAID";
                    paidAmount = recurrence.currentAmount;
                    remainingAmount = 0;
                }
            } else if (format(dueDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
                cycleStatus = "OPEN";
            } else {
                cycleStatus = "PROJECTED";
            }

            rawCycles.push({
                balanceId: recurrence.balanceId,
                from: fromStr,
                to: toStr,
                dueDate: dueDateStr,
                label: `Semana ${w + 1} • ${format(weekStart, "dd/MM")} a ${format(weekEnd, "dd/MM")}`,
                status: cycleStatus,
                totalAmount: recurrence.currentAmount,
                paidAmount,
                remainingAmount,
                isOverdue: cycleStatus === "OVERDUE",
                movementsCount: cycleStatus === "PROJECTED" ? 0 : 1,
                settlementDate: cycleStatus === "PAID" ? dueDateStr : null,
                referenceDate: fromStr,
            });
        }
    } else {
        // Padrão: MONTHLY (1 ano civil)
        const targetDate = addYears(today, offset);
        const targetYear = getYear(targetDate);

        horizon = {
            label: `${targetYear}`,
            offset,
            canPrev: true,
            canNext: true,
            prevOffset: offset - 1,
            nextOffset: offset + 1,
            isCustom: false,
        };

        const currentMonthIdx = today.getMonth(); // 0 a 11

        for (let m = 0; m < 12; m++) {
            const monthDate = new Date(targetYear, m, 1);
            const monthStart = startOfMonth(monthDate);
            const monthEnd = endOfMonth(monthDate);

            const fromStr = format(monthStart, "yyyy-MM-dd");
            const toStr = format(monthEnd, "yyyy-MM-dd");

            const maxDaysInMonth = monthEnd.getDate();
            const safeDueDay = Math.min(Math.max(recurrence.dueDay, 1), maxDaysInMonth);
            const dueDate = new Date(targetYear, m, safeDueDay);
            const dueDateStr = format(dueDate, "yyyy-MM-dd");

            let cycleStatus: CycleItem["status"];
            let paidAmount = 0;
            let remainingAmount = recurrence.currentAmount;

            if (targetYear < currentYear || (targetYear === currentYear && m < currentMonthIdx)) {
                // Meses passados
                if (m === currentMonthIdx - 1 && recurrence.isOverdue) {
                    cycleStatus = "OVERDUE";
                } else {
                    cycleStatus = "PAID";
                    paidAmount = recurrence.currentAmount;
                    remainingAmount = 0;
                }
            } else if (targetYear === currentYear && m === currentMonthIdx) {
                // Mês corrente
                if (recurrence.isOverdue) {
                    cycleStatus = "OVERDUE";
                } else {
                    cycleStatus = "PENDING";
                }
            } else {
                // Meses futuros
                cycleStatus = "PROJECTED";
            }

            rawCycles.push({
                balanceId: recurrence.balanceId,
                from: fromStr,
                to: toStr,
                dueDate: dueDateStr,
                label: `${MONTH_NAMES[m]} ${targetYear}`,
                status: cycleStatus,
                totalAmount: recurrence.currentAmount,
                paidAmount,
                remainingAmount,
                isOverdue: cycleStatus === "OVERDUE",
                movementsCount: cycleStatus === "PROJECTED" ? 0 : 1,
                settlementDate: cycleStatus === "PAID" ? `${targetYear}-${String(m + 1).padStart(2, "0")}-05` : null,
                referenceDate: fromStr,
            });
        }
    }

    // Filtragem em memória
    let filteredCycles = rawCycles;

    if (!includeProjected) {
        filteredCycles = filteredCycles.filter((c) => c.status !== "PROJECTED");
    }

    if (status === "OVERDUE") {
        filteredCycles = filteredCycles.filter((c) => c.status === "OVERDUE");
    } else if (status === "PENDING") {
        filteredCycles = filteredCycles.filter(
            (c) =>
                c.status === "PENDING" ||
                c.status === "OPEN" ||
                c.status === "PARTIAL"
        );
    } else if (status === "PAID") {
        filteredCycles = filteredCycles.filter(
            (c) => c.status === "PAID" || c.status === "SETTLED"
        );
    }

    return {
        horizon,
        cycles: filteredCycles,
    };
}
