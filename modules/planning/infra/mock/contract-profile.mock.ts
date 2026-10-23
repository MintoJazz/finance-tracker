import { Page } from "@/types/pagination.types";
import { Result, success } from "@/types/result.types";
import {
    ContractCycleItem,
    GetContractCyclesDTO,
} from "../../core/schemas/contract-cycle.schema";
import { ContractProfile } from "../../core/schemas/contract-profile.schema";
import { mockContracts } from "../mocks/contracts.mock";

const MOCK_CYCLES_BY_CONTRACT: Record<number, ContractCycleItem[]> = {
    1: [
        // ================= CICLOS CONSOLIDADOS (PASSADOS) =================
        {
            cycleKey: "contract-1-2026-06",
            contractId: 1,
            label: "Junho 2026",
            from: "2026-06-01",
            to: "2026-06-30",
            dueDate: new Date("2026-06-05T12:00:00.000Z"),
            status: "PAID",
            totalAmount: 150000,
            paidAmount: 150000,
            remainingAmount: 0,
            movementsCount: 2,
            settlementDate: new Date("2026-06-05T10:30:00.000Z"),
        },
        {
            cycleKey: "contract-1-2026-07",
            contractId: 1,
            label: "Julho 2026",
            from: "2026-07-01",
            to: "2026-07-31",
            dueDate: new Date("2026-07-05T12:00:00.000Z"),
            status: "PAID",
            totalAmount: 150000,
            paidAmount: 150000,
            remainingAmount: 0,
            movementsCount: 2,
            settlementDate: new Date("2026-07-04T15:20:00.000Z"),
        },
        {
            cycleKey: "contract-1-2026-08",
            contractId: 1,
            label: "Agosto 2026",
            from: "2026-08-01",
            to: "2026-08-31",
            dueDate: new Date("2026-08-05T12:00:00.000Z"),
            status: "PAID",
            totalAmount: 150000,
            paidAmount: 150000,
            remainingAmount: 0,
            movementsCount: 2,
            settlementDate: new Date("2026-08-05T09:15:00.000Z"),
        },
        {
            cycleKey: "contract-1-2026-09",
            contractId: 1,
            label: "Setembro 2026",
            from: "2026-09-01",
            to: "2026-09-30",
            dueDate: new Date("2026-09-05T12:00:00.000Z"),
            status: "PAID",
            totalAmount: 150000,
            paidAmount: 150000,
            remainingAmount: 0,
            movementsCount: 2,
            settlementDate: new Date("2026-09-05T11:00:00.000Z"),
        },
        // ================= CICLO CORRENTE =================
        {
            cycleKey: "contract-1-2026-10",
            contractId: 1,
            label: "Outubro 2026",
            from: "2026-10-01",
            to: "2026-10-31",
            dueDate: new Date("2026-10-05T12:00:00.000Z"),
            status: "OVERDUE",
            totalAmount: 150000,
            paidAmount: 50000,
            remainingAmount: 100000,
            movementsCount: 2,
            settlementDate: null,
        },
        // ================= CICLOS PROJETADOS (FUTUROS) =================
        {
            cycleKey: "contract-1-2026-11",
            contractId: 1,
            label: "Novembro 2026",
            from: "2026-11-01",
            to: "2026-11-30",
            dueDate: new Date("2026-11-05T12:00:00.000Z"),
            status: "PROJECTED",
            totalAmount: 150000,
            paidAmount: 0,
            remainingAmount: 150000,
            movementsCount: 0,
            settlementDate: null,
        },
        {
            cycleKey: "contract-1-2026-12",
            contractId: 1,
            label: "Dezembro 2026",
            from: "2026-12-01",
            to: "2026-12-31",
            dueDate: new Date("2026-12-05T12:00:00.000Z"),
            status: "PROJECTED",
            totalAmount: 150000,
            paidAmount: 0,
            remainingAmount: 150000,
            movementsCount: 0,
            settlementDate: null,
        },
        {
            cycleKey: "contract-1-2027-01",
            contractId: 1,
            label: "Janeiro 2027",
            from: "2027-01-01",
            to: "2027-01-31",
            dueDate: new Date("2027-01-05T12:00:00.000Z"),
            status: "PROJECTED",
            totalAmount: 150000,
            paidAmount: 0,
            remainingAmount: 150000,
            movementsCount: 0,
            settlementDate: null,
        },
        {
            cycleKey: "contract-1-2027-02",
            contractId: 1,
            label: "Fevereiro 2027",
            from: "2027-02-01",
            to: "2027-02-28",
            dueDate: new Date("2027-02-05T12:00:00.000Z"),
            status: "PROJECTED",
            totalAmount: 150000,
            paidAmount: 0,
            remainingAmount: 150000,
            movementsCount: 0,
            settlementDate: null,
        },
        {
            cycleKey: "contract-1-2027-03",
            contractId: 1,
            label: "Março 2027",
            from: "2027-03-01",
            to: "2027-03-31",
            dueDate: new Date("2027-03-05T12:00:00.000Z"),
            status: "PROJECTED",
            totalAmount: 150000,
            paidAmount: 0,
            remainingAmount: 150000,
            movementsCount: 0,
            settlementDate: null,
        },
    ],
};

function generateFallbackCycles(contractId: number, baseValue: number, dueDay: number): ContractCycleItem[] {
    const months = [
        { label: "Julho 2026", from: "2026-07-01", to: "2026-07-31", due: `2026-07-${String(dueDay).padStart(2, "0")}`, status: "PAID" as const, paid: baseValue },
        { label: "Agosto 2026", from: "2026-08-01", to: "2026-08-31", due: `2026-08-${String(dueDay).padStart(2, "0")}`, status: "PAID" as const, paid: baseValue },
        { label: "Setembro 2026", from: "2026-09-01", to: "2026-09-30", due: `2026-09-${String(dueDay).padStart(2, "0")}`, status: "PAID" as const, paid: baseValue },
        { label: "Outubro 2026", from: "2026-10-01", to: "2026-10-31", due: `2026-10-${String(dueDay).padStart(2, "0")}`, status: "PENDING" as const, paid: 0 },
        { label: "Novembro 2026", from: "2026-11-01", to: "2026-11-30", due: `2026-11-${String(dueDay).padStart(2, "0")}`, status: "PROJECTED" as const, paid: 0 },
        { label: "Dezembro 2026", from: "2026-12-01", to: "2026-12-31", due: `2026-12-${String(dueDay).padStart(2, "0")}`, status: "PROJECTED" as const, paid: 0 },
        { label: "Janeiro 2027", from: "2027-01-01", to: "2027-01-31", due: `2027-01-${String(dueDay).padStart(2, "0")}`, status: "PROJECTED" as const, paid: 0 },
    ];

    return months.map((m) => ({
        cycleKey: `contract-${contractId}-${m.from.substring(0, 7)}`,
        contractId,
        label: m.label,
        from: m.from,
        to: m.to,
        dueDate: new Date(`${m.due}T12:00:00.000Z`),
        status: m.status,
        totalAmount: baseValue,
        paidAmount: m.paid,
        remainingAmount: baseValue - m.paid,
        movementsCount: m.status !== "PROJECTED" ? 1 : 0,
        settlementDate: m.status === "PAID" ? new Date(`${m.due}T10:00:00.000Z`) : null,
    }));
}

function calculateSummary(cycles: ContractCycleItem[]) {
    let totalPaid = 0;
    let totalPending = 0;
    let totalProjected = 0;
    let overdueCount = 0;
    let overdueAmount = 0;
    let consolidatedCount = 0;
    let projectedCount = 0;
    let nextDueDate: Date | null = null;

    const now = new Date();

    for (const c of cycles) {
        if (c.status !== "PROJECTED") {
            consolidatedCount++;
            totalPaid += c.paidAmount;
            totalPending += c.remainingAmount;
            if (c.status === "OVERDUE") {
                overdueCount++;
                overdueAmount += c.remainingAmount;
            }
        } else {
            projectedCount++;
            totalProjected += c.totalAmount;
        }

        if (c.dueDate >= now && (!nextDueDate || c.dueDate < nextDueDate)) {
            nextDueDate = c.dueDate;
        }
    }

    return {
        totalPaid,
        totalPending,
        totalProjected,
        overdueCount,
        overdueAmount,
        nextDueDate,
        cyclesCount: {
            total: cycles.length,
            consolidated: consolidatedCount,
            projected: projectedCount,
        },
    };
}

export class ContractProfileMockService {
    static async getProfileById(id: number): Promise<Result<ContractProfile>> {
        await new Promise((resolve) => setTimeout(resolve, 140));

        const base = mockContracts.find((c) => c.id === id || c.balanceId === id);
        const resolvedId = base?.id ?? id;
        const cycles = MOCK_CYCLES_BY_CONTRACT[resolvedId] ?? generateFallbackCycles(resolvedId, base?.value ?? 100000, base?.dueDay ?? 10);
        const summary = calculateSummary(cycles);

        if (base) {
            return success({
                id: base.id,
                balanceId: base.balanceId,
                name: base.name,
                type: base.type,
                value: base.value,
                frequency: base.frequency,
                dueDay: base.dueDay,
                dueMonth: base.dueMonth ?? null,
                closingDay: null,
                closingMonth: null,
                startsAt: base.startsAt,
                endsAt: base.endsAt,
                includeInProjection: base.includeInProjection,
                isArchived: base.isArchived,
                createdAt: base.startsAt,
                summary,
            });
        }

        // Fallback genérico para IDs arbitrários
        return success({
            id: resolvedId,
            balanceId: resolvedId + 100,
            name: `Contrato #${resolvedId}`,
            type: "PAYABLE",
            value: 120000,
            frequency: "MONTHLY",
            dueDay: 10,
            dueMonth: null,
            closingDay: null,
            closingMonth: null,
            startsAt: new Date("2026-01-01T00:00:00.000Z"),
            endsAt: null,
            includeInProjection: true,
            isArchived: false,
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            summary,
        });
    }

    static async getCycles(dto: GetContractCyclesDTO): Promise<Result<Page<ContractCycleItem>>> {
        await new Promise((resolve) => setTimeout(resolve, 120));

        const { contractId, pageRequest, filter } = dto;
        const allCycles = MOCK_CYCLES_BY_CONTRACT[contractId] ?? generateFallbackCycles(contractId, 100000, 10);

        let filtered = [...allCycles];

        if (filter) {
            if (filter.includeProjected === false) {
                filtered = filtered.filter((c) => c.status !== "PROJECTED");
            }

            if (filter.q && filter.q.trim().length > 0) {
                const searchLower = filter.q.trim().toLowerCase();
                filtered = filtered.filter((c) => c.label.toLowerCase().includes(searchLower));
            }

            if (filter.statuses && filter.statuses.length > 0) {
                filtered = filtered.filter((c) => filter.statuses!.includes(c.status));
            }
        }

        // Ordenação cronológica por vencimento ASC
        filtered.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

        const total = filtered.length;
        const page = Math.max(1, Number(pageRequest.page) || 1);
        const pageSize = Math.max(1, Number(pageRequest.pageSize) || 10);
        const pageCount = Math.ceil(total / pageSize) || 1;
        const pageIndex = page - 1;
        const skip = pageIndex * pageSize;

        return success({
            data: filtered.slice(skip, skip + pageSize),
            total,
            pageIndex,
            pageSize,
            pageCount,
        });
    }
}
