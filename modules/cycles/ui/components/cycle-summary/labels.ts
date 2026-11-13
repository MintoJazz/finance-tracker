import { MovementEntryScope } from "@/modules/movements/models/movement-entry.schema";
import { CycleStatus } from "@/modules/cycles/models/cycle-primitives.schema";
import { CycleSummaryLabels } from "./types";
import { CycleStatusTone } from "../cycle-navigator/types";

export const CYCLE_SUMMARY_LABELS: Record<MovementEntryScope, CycleSummaryLabels> = {
    CARD: {
        total: "Total da fatura",
        period: "Ciclo",
        dueDate: "Vencimento",
        paid: "Pago",
        open: "Em aberto",
    },
    CONTRACT_CYCLE: {
        total: "Total do ciclo",
        period: "Competência",
        dueDate: "Vencimento",
        paid: "Pago",
        open: "Em aberto",
    },
    WALLET: {
        total: "Total",
        period: "Período",
        dueDate: "Vencimento",
        paid: "Pago",
        open: "Em aberto",
    },
};

export const CYCLE_STATUS_TONE_MAP: Record<
    CycleStatus,
    { label: string; tone: CycleStatusTone }
> = {
    OVERDUE: { label: "Vencida", tone: "destructive" },
    PARTIAL: { label: "Parcialmente paga", tone: "amber" },
    PAID: { label: "Paga", tone: "emerald" },
    SETTLED: { label: "Liquidada", tone: "emerald" },
    OPEN: { label: "Aberta", tone: "neutral" },
    PENDING: { label: "Fechada", tone: "neutral" },
    PROJECTED: { label: "Projetada", tone: "neutral" },
    TRANSFERRED: { label: "Transferida", tone: "neutral" },
    UNRECORDED: { label: "Não lançada", tone: "neutral" },
};

export const STATUS_BADGE_CLASSES: Record<CycleStatusTone, string> = {
    destructive:
        "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:border-destructive/30",
    amber:
        "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
    emerald:
        "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
    neutral: "bg-muted/60 text-muted-foreground border-border/60",
};

