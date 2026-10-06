import {
    CommitmentCycleStatusEnum,
    CommitmentSourceTypeEnum,
} from "../schemas/commitment-cycle.schema";

export interface CommitmentStatusMeta {
    label: string;
    badgeClassName: string;
}

export const COMMITMENT_STATUS_REGISTRY: Record<
    CommitmentCycleStatusEnum,
    CommitmentStatusMeta
> = {
    OVERDUE: {
        label: "Vencido",
        badgeClassName:
            "border-rose-500/30 text-rose-700 dark:text-rose-400 bg-rose-500/10",
    },
    PENDING: {
        label: "A pagar",
        badgeClassName:
            "border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10",
    },
    PARTIAL: {
        label: "Parcial",
        badgeClassName:
            "border-violet-500/30 text-violet-700 dark:text-violet-400 bg-violet-500/10",
    },
    OPEN: {
        label: "Em aberto",
        badgeClassName:
            "border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10",
    },
    PAID: {
        label: "Pago",
        badgeClassName:
            "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
    },
};

export const COMMITMENT_SOURCE_TYPE_REGISTRY: Record<
    CommitmentSourceTypeEnum,
    { label: string; shortLabel: string }
> = {
    COMMITMENT: {
        label: "Contrato",
        shortLabel: "Contrato",
    },
    CREDIT: {
        label: "Cartão de Crédito",
        shortLabel: "Cartão",
    },
};