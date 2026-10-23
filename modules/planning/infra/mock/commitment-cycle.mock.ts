import { Page } from "@/types/pagination.types";
import { Result, success } from "@/types/result.types";
import {
    CommitmentCycleFilters,
    CommitmentCycleItem,
    CommitmentsPeriodSummary,
    GetCommitmentCyclesDTO,
    GetCommitmentsSummaryDTO,
} from "../../core/schemas/commitment-cycle.schema";

const RAW_MOCK_COMMITMENT_CYCLES: Omit<CommitmentCycleItem, "kind">[] = [
    // =========================================================================
    // SETEMBRO 2026
    // =========================================================================
    {
        balanceId: 1,
        balanceName: "Nubank Ultravioleta Mastercard Black",
        balanceType: "CREDIT",
        label: "Agosto 2026",
        from: "2026-07-28",
        to: "2026-08-27",
        dueDate: new Date("2026-09-05T12:00:00.000Z"),
        totalAmount: 384590,
        paidAmount: 384590,
        remainingAmount: 0,
        status: "PAID",
    },
    {
        balanceId: 101,
        balanceName: "Aluguel Apartamento Centro",
        balanceType: "COMMITMENT",
        label: "Setembro 2026",
        from: "2026-09-01",
        to: "2026-09-30",
        dueDate: new Date("2026-09-10T12:00:00.000Z"),
        totalAmount: 280000,
        paidAmount: 280000,
        remainingAmount: 0,
        status: "PAID",
    },
    {
        balanceId: 102,
        balanceName: "Internet Fibra Vivo 600MB",
        balanceType: "COMMITMENT",
        label: "Setembro 2026",
        from: "2026-09-01",
        to: "2026-09-30",
        dueDate: new Date("2026-09-15T12:00:00.000Z"),
        totalAmount: 14990,
        paidAmount: 14990,
        remainingAmount: 0,
        status: "PAID",
    },

    // =========================================================================
    // OUTUBRO 2026 (Mês Corrente: Atrasados, Pendentes, Parciais e Pagos)
    // =========================================================================
    {
        balanceId: 103,
        balanceName: "Energia Elétrica CEEE Equatorial",
        balanceType: "COMMITMENT",
        label: "Outubro 2026",
        from: "2026-10-01",
        to: "2026-10-31",
        dueDate: new Date("2026-10-03T12:00:00.000Z"),
        totalAmount: 28450,
        paidAmount: 0,
        remainingAmount: 28450,
        status: "OVERDUE",
    },
    {
        balanceId: 1,
        balanceName: "Nubank Ultravioleta Mastercard Black",
        balanceType: "CREDIT",
        label: "Setembro 2026",
        from: "2026-08-28",
        to: "2026-09-27",
        dueDate: new Date("2026-10-05T12:00:00.000Z"),
        totalAmount: 462030,
        paidAmount: 0,
        remainingAmount: 462030,
        status: "OVERDUE",
    },
    {
        balanceId: 104,
        balanceName: "Condomínio Edifício Solar",
        balanceType: "COMMITMENT",
        label: "Outubro 2026",
        from: "2026-10-01",
        to: "2026-10-31",
        dueDate: new Date("2026-10-08T12:00:00.000Z"),
        totalAmount: 65000,
        paidAmount: 65000,
        remainingAmount: 0,
        status: "PAID",
    },
    {
        balanceId: 101,
        balanceName: "Aluguel Apartamento Centro",
        balanceType: "COMMITMENT",
        label: "Outubro 2026",
        from: "2026-10-01",
        to: "2026-10-31",
        dueDate: new Date("2026-10-10T12:00:00.000Z"),
        totalAmount: 280000,
        paidAmount: 140000,
        remainingAmount: 140000,
        status: "PARTIAL",
    },
    {
        balanceId: 105,
        balanceName: "Cota Rateio Casa (Mercado & Limpeza)",
        balanceType: "COMMITMENT",
        label: "Outubro 2026",
        from: "2026-10-01",
        to: "2026-10-31",
        dueDate: new Date("2026-10-12T12:00:00.000Z"),
        totalAmount: 78000,
        paidAmount: 0,
        remainingAmount: 78000,
        status: "PENDING",
    },
    {
        balanceId: 102,
        balanceName: "Internet Fibra Vivo 600MB",
        balanceType: "COMMITMENT",
        label: "Outubro 2026",
        from: "2026-10-01",
        to: "2026-10-31",
        dueDate: new Date("2026-10-15T12:00:00.000Z"),
        totalAmount: 14990,
        paidAmount: 14990,
        remainingAmount: 0,
        status: "PAID",
    },
    {
        balanceId: 106,
        balanceName: "Plano de Saúde Unimed",
        balanceType: "COMMITMENT",
        label: "Outubro 2026",
        from: "2026-10-01",
        to: "2026-10-31",
        dueDate: new Date("2026-10-20T12:00:00.000Z"),
        totalAmount: 58900,
        paidAmount: 0,
        remainingAmount: 58900,
        status: "PENDING",
    },
    {
        balanceId: 107,
        balanceName: "Academia Smart Fit Black",
        balanceType: "COMMITMENT",
        label: "Outubro 2026",
        from: "2026-10-01",
        to: "2026-10-31",
        dueDate: new Date("2026-10-25T12:00:00.000Z"),
        totalAmount: 13990,
        paidAmount: 0,
        remainingAmount: 13990,
        status: "OPEN",
    },

    // =========================================================================
    // NOVEMBRO E DEZEMBRO 2026 (Projeções Futuras / Faturas Abertas)
    // =========================================================================
    {
        balanceId: 1,
        balanceName: "Nubank Ultravioleta Mastercard Black",
        balanceType: "CREDIT",
        label: "Outubro 2026",
        from: "2026-09-28",
        to: "2026-10-27",
        dueDate: new Date("2026-11-05T12:00:00.000Z"),
        totalAmount: 294370,
        paidAmount: 0,
        remainingAmount: 294370,
        status: "OPEN",
    },
    {
        balanceId: 101,
        balanceName: "Aluguel Apartamento Centro",
        balanceType: "COMMITMENT",
        label: "Novembro 2026",
        from: "2026-11-01",
        to: "2026-11-30",
        dueDate: new Date("2026-11-10T12:00:00.000Z"),
        totalAmount: 280000,
        paidAmount: 0,
        remainingAmount: 280000,
        status: "OPEN",
    },
    {
        balanceId: 106,
        balanceName: "Plano de Saúde Unimed",
        balanceType: "COMMITMENT",
        label: "Novembro 2026",
        from: "2026-11-01",
        to: "2026-11-30",
        dueDate: new Date("2026-11-20T12:00:00.000Z"),
        totalAmount: 58900,
        paidAmount: 0,
        remainingAmount: 58900,
        status: "OPEN",
    },
    {
        balanceId: 1,
        balanceName: "Nubank Ultravioleta Mastercard Black",
        balanceType: "CREDIT",
        label: "Novembro 2026",
        from: "2026-10-28",
        to: "2026-11-27",
        dueDate: new Date("2026-12-05T12:00:00.000Z"),
        totalAmount: 125000,
        paidAmount: 0,
        remainingAmount: 125000,
        status: "OPEN",
    },
];

const MOCK_COMMITMENT_CYCLES: CommitmentCycleItem[] = RAW_MOCK_COMMITMENT_CYCLES.map(
    (item) => ({
        ...item,
    })
);

function applyCycleFilters(
    items: CommitmentCycleItem[],
    filter: CommitmentCycleFilters
): CommitmentCycleItem[] {
    let dataset = [...items];

    if (filter.from) {
        const fromTime = new Date(`${filter.from}T00:00:00.000Z`).getTime();
        dataset = dataset.filter((item) => item.dueDate.getTime() >= fromTime);
    }

    if (filter.to) {
        const toTime = new Date(`${filter.to}T23:59:59.999Z`).getTime();
        dataset = dataset.filter((item) => item.dueDate.getTime() <= toTime);
    }

    if (filter.q && filter.q.trim().length > 0) {
        const searchLower = filter.q.trim().toLowerCase();
        dataset = dataset.filter(
            (item) =>
                item.balanceName.toLowerCase().includes(searchLower) ||
                item.label.toLowerCase().includes(searchLower)
        );
    }

    if (filter.balanceTypes && filter.balanceTypes.length > 0) {
        dataset = dataset.filter((item) =>
            filter.balanceTypes!.includes(item.balanceType)
        );
    }

    if (filter.statuses && filter.statuses.length > 0) {
        dataset = dataset.filter((item) =>
            filter.statuses!.includes(item.status)
        );
    }

    // Ordena cronologicamente por data de vencimento (mais próximos primeiro)
    dataset.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return dataset;
}

export class CommitmentCycleMockService {
    static async getCycles(
        dto: GetCommitmentCyclesDTO
    ): Promise<Result<Page<CommitmentCycleItem>>> {
        await new Promise((resolve) => setTimeout(resolve, 160));

        const { pageRequest, filter } = dto;
        const filtered = applyCycleFilters(MOCK_COMMITMENT_CYCLES, filter);

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

    static async getSummary(
        dto: GetCommitmentsSummaryDTO
    ): Promise<Result<CommitmentsPeriodSummary>> {
        await new Promise((resolve) => setTimeout(resolve, 140));

        const filtered = applyCycleFilters(MOCK_COMMITMENT_CYCLES, dto.filter);

        let totalAmount = 0;
        let paidAmount = 0;
        let pendingAmount = 0;
        let overdueAmount = 0;
        let overdueCount = 0;

        for (const item of filtered) {
            totalAmount += item.totalAmount;
            paidAmount += item.paidAmount;
            pendingAmount += item.remainingAmount;

            if (item.status === "OVERDUE" && item.remainingAmount > 0) {
                overdueAmount += item.remainingAmount;
                overdueCount += 1;
            }
        }

        return success({
            totalAmount,
            paidAmount,
            pendingAmount,
            overdueAmount,
            overdueCount,
        });
    }
}