import {
    getInstallmentStatus,
    getRemainingAmount,
    type InstallmentCard,
    type InstallmentFilters,
    type InstallmentListItem,
} from "@/modules/installments/models/schemas/installment-item.schema";

export const MOCK_INSTALLMENT_CARDS: InstallmentCard[] = [
    { id: 1, name: "Nubank" },
    { id: 2, name: "Itaú Click" },
    { id: 3, name: "Inter Gold" },
];

const [NUBANK, ITAU, INTER] = MOCK_INSTALLMENT_CARDS;

export const MOCK_INSTALLMENTS: InstallmentListItem[] = [
    {
        id: 301,
        description: "iPhone 16 Pro 256GB",
        type: "INVOICE",
        totalAmount: 960000,
        installmentAmount: 80000,
        totalInstallments: 12,
        paidInstallments: 5,
        purchaseDate: "2026-06-12",
        nextDueDate: "2026-12-10",
        endsAt: "2027-05-10",
        isOverdue: false,
        card: NUBANK,
        category: { balanceId: 401, name: "Eletrônicos", color: "indigo" },
        icon: "smartphone",
        color: "indigo",
    },
    {
        id: 302,
        description: "Geladeira Brastemp Inverse",
        type: "INVOICE",
        totalAmount: 540000,
        installmentAmount: 45000,
        totalInstallments: 12,
        paidInstallments: 9,
        purchaseDate: "2026-02-20",
        nextDueDate: "2026-11-10",
        endsAt: "2027-01-10",
        isOverdue: true,
        card: ITAU,
        category: { balanceId: 402, name: "Eletrodomésticos", color: "sky" },
        icon: "refrigerator",
        color: "sky",
    },
    {
        id: 303,
        description: "Notebook Dell XPS 15",
        type: "INVOICE",
        totalAmount: 1260000,
        installmentAmount: 105000,
        totalInstallments: 12,
        paidInstallments: 2,
        purchaseDate: "2026-09-03",
        nextDueDate: "2026-12-15",
        endsAt: "2027-08-15",
        isOverdue: false,
        card: INTER,
        category: { balanceId: 401, name: "Eletrônicos", color: "indigo" },
        icon: "laptop",
        color: "indigo",
    },
    {
        id: 304,
        description: "Passagens Aéreas Lisboa",
        type: "INVOICE",
        totalAmount: 720000,
        installmentAmount: 60000,
        totalInstallments: 12,
        paidInstallments: 12,
        purchaseDate: "2025-11-01",
        nextDueDate: null,
        endsAt: "2026-10-05",
        isOverdue: false,
        card: NUBANK,
        category: { balanceId: 403, name: "Viagens", color: "cyan" },
        icon: "plane",
        color: "cyan",
    },
    {
        id: 305,
        description: "Sofá Retrátil 3 Lugares",
        type: "INVOICE",
        totalAmount: 360000,
        installmentAmount: 36000,
        totalInstallments: 10,
        paidInstallments: 6,
        purchaseDate: "2026-05-18",
        nextDueDate: "2026-12-05",
        endsAt: "2027-03-05",
        isOverdue: false,
        card: ITAU,
        category: { balanceId: 404, name: "Casa & Decoração", color: "amber" },
        icon: "sofa",
        color: "amber",
    },
    {
        id: 306,
        description: "Curso de Especialização UX",
        type: "MONTHLY",
        totalAmount: 480000,
        installmentAmount: 40000,
        totalInstallments: 12,
        paidInstallments: 7,
        purchaseDate: "2026-04-22",
        nextDueDate: "2026-12-22",
        endsAt: "2027-03-22",
        isOverdue: false,
        card: null,
        category: { balanceId: 405, name: "Educação", color: "violet" },
        icon: "graduation-cap",
        color: "violet",
    },
    {
        id: 307,
        description: "Tratamento Odontológico",
        type: "INVOICE",
        totalAmount: 300000,
        installmentAmount: 25000,
        totalInstallments: 12,
        paidInstallments: 11,
        purchaseDate: "2025-12-15",
        nextDueDate: "2026-12-15",
        endsAt: "2026-12-15",
        isOverdue: false,
        card: INTER,
        category: { balanceId: 406, name: "Saúde", color: "rose" },
        icon: "heart-pulse",
        color: "rose",
    },
    {
        id: 308,
        description: "Smart TV Samsung 65\"",
        type: "INVOICE",
        totalAmount: 420000,
        installmentAmount: 35000,
        totalInstallments: 12,
        paidInstallments: 12,
        purchaseDate: "2025-10-10",
        nextDueDate: null,
        endsAt: "2026-09-10",
        isOverdue: false,
        card: NUBANK,
        category: { balanceId: 401, name: "Eletrônicos", color: "indigo" },
        icon: "tv",
        color: "indigo",
    },
    {
        id: 309,
        description: "Pneus e Alinhamento",
        type: "INVOICE",
        totalAmount: 240000,
        installmentAmount: 40000,
        totalInstallments: 6,
        paidInstallments: 3,
        purchaseDate: "2026-08-08",
        nextDueDate: "2026-11-08",
        endsAt: "2027-01-08",
        isOverdue: true,
        card: ITAU,
        category: { balanceId: 407, name: "Veículo", color: "amber" },
        icon: "car",
        color: "amber",
    },
    {
        id: 310,
        description: "Guarda-roupa Planejado",
        type: "MONTHLY",
        totalAmount: 890000,
        installmentAmount: 89000,
        totalInstallments: 10,
        paidInstallments: 1,
        purchaseDate: "2026-10-20",
        nextDueDate: "2026-12-20",
        endsAt: "2027-08-20",
        isOverdue: false,
        card: null,
        category: { balanceId: 404, name: "Casa & Decoração", color: "amber" },
        icon: "armchair",
        color: "amber",
    },
    {
        id: 311,
        description: "Bicicleta Elétrica",
        type: "INVOICE",
        totalAmount: 660000,
        installmentAmount: 55000,
        totalInstallments: 12,
        paidInstallments: 4,
        purchaseDate: "2026-07-14",
        nextDueDate: "2026-12-14",
        endsAt: "2027-07-14",
        isOverdue: false,
        card: NUBANK,
        category: { balanceId: 408, name: "Lazer & Esportes", color: "emerald" },
        icon: "bike",
        color: "emerald",
    },
    {
        id: 312,
        description: "Mensalidade Pós-Graduação",
        type: "INVOICE",
        totalAmount: 1800000,
        installmentAmount: 75000,
        totalInstallments: 24,
        paidInstallments: 14,
        purchaseDate: "2025-09-30",
        nextDueDate: "2026-12-30",
        endsAt: "2027-09-30",
        isOverdue: false,
        card: INTER,
        category: { balanceId: 405, name: "Educação", color: "violet" },
        icon: "graduation-cap",
        color: "violet",
    },
];

/**
 * Aplica filtragem em memória sobre a lista de parcelamentos de acordo com os filtros ativos.
 */
export function filterInstallments(
    items: InstallmentListItem[],
    filters: InstallmentFilters
): InstallmentListItem[] {
    const term = filters.q?.trim().toLowerCase();

    return items.filter((item) => {
        if (filters.status !== "ALL" && getInstallmentStatus(item) !== filters.status) {
            return false;
        }
        if (filters.cardId && item.card?.id !== filters.cardId) {
            return false;
        }
        if (term) {
            const matchesDescription = item.description.toLowerCase().includes(term);
            const matchesCategory = item.category?.name.toLowerCase().includes(term);
            const matchesCard = item.card?.name.toLowerCase().includes(term);
            if (!matchesDescription && !matchesCategory && !matchesCard) {
                return false;
            }
        }
        return true;
    });
}

export interface InstallmentsSummary {
    /** Saldo devedor total dos parcelamentos em aberto (centavos). */
    remainingAmount: number;
    /** Soma das parcelas que vencem no mês de referência (centavos). */
    monthAmount: number;
    overdueCount: number;
    openCount: number;
}

/** Resumo exibido no topo da listagem. `monthPrefix` no formato `YYYY-MM`. */
export function summarizeInstallments(
    items: InstallmentListItem[],
    monthPrefix: string
): InstallmentsSummary {
    return items.reduce<InstallmentsSummary>(
        (acc, item) => {
            const status = getInstallmentStatus(item);
            if (status === "PAID") return acc;
            acc.openCount += 1;
            acc.remainingAmount += getRemainingAmount(item);
            if (status === "OVERDUE") acc.overdueCount += 1;
            if (item.nextDueDate?.startsWith(monthPrefix)) {
                acc.monthAmount += item.installmentAmount;
            }
            return acc;
        },
        { remainingAmount: 0, monthAmount: 0, overdueCount: 0, openCount: 0 }
    );
}
