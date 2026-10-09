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
            "text-rose-700 dark:text-rose-400",
    },
    PENDING: {
        label: "A pagar",
        badgeClassName:
            "text-amber-700 dark:text-amber-400",
    },
    PARTIAL: {
        label: "Parcial",
        badgeClassName:
            "text-muted-foreground",
    },
    OPEN: {
        label: "Em aberto",
        badgeClassName:
            "text-muted-foreground",
    },
    PAID: {
        label: "Pago",
        badgeClassName:
            "text-emerald-700 dark:text-emerald-400",
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