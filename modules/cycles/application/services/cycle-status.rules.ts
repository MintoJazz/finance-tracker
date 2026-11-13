import { isAfter, isBefore, startOfDay } from "date-fns";
import { CommitmentCycleStatusEnum } from "@/modules/cycles/models/commitment-cycle.schema";
import { CycleStatus } from "@/modules/cycles/models/cycle-primitives.schema";

export interface CycleStatusEvaluationContext {
    totalEntriesCount: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    recognizedAmount: number;
    transferredAmount?: number;
    dueDate: Date;
    endsAt: Date;
    today: Date;
    currentPeriodStart?: Date;
}

export interface ICycleStatusRule<TStatus> {
    readonly name: string;
    matches(ctx: CycleStatusEvaluationContext): boolean;
    resolve(ctx: CycleStatusEvaluationContext): TStatus;
}

/**
 * Avaliador de regras que itera pelo catálogo e resolve o status da primeira regra satisfeita.
 */
export class CycleStatusEvaluator<TStatus> {
    constructor(
        public readonly rules: ReadonlyArray<ICycleStatusRule<TStatus>>,
        public readonly defaultStatus: TStatus
    ) {}

    evaluate(ctx: CycleStatusEvaluationContext): TStatus {
        for (const rule of this.rules) {
            if (rule.matches(ctx)) {
                return rule.resolve(ctx);
            }
        }
        return this.defaultStatus;
    }
}

// ============================================================================
// Regras Atômicas para Compromissos (CommitmentCycleItem & CycleDetail)
// ============================================================================

export const ZeroEntriesCommitmentRule: ICycleStatusRule<CommitmentCycleStatusEnum> = {
    name: "ZeroEntriesCommitmentRule",
    matches: (ctx) => ctx.totalEntriesCount === 0,
    resolve: () => "PROJECTED",
};

export const SettledCommitmentRule: ICycleStatusRule<CommitmentCycleStatusEnum> = {
    name: "SettledCommitmentRule",
    matches: (ctx) => ctx.totalAmount > 0 && ctx.paidAmount >= ctx.totalAmount,
    resolve: () => "PAID",
};

export const TransferredCommitmentRule: ICycleStatusRule<CommitmentCycleStatusEnum> = {
    name: "TransferredCommitmentRule",
    matches: (ctx) =>
        (ctx.transferredAmount ?? 0) > 0 &&
        ctx.remainingAmount === 0 &&
        ctx.paidAmount < ctx.totalAmount,
    resolve: () => "TRANSFERRED",
};

export const OverdueCommitmentRule: ICycleStatusRule<CommitmentCycleStatusEnum> = {
    name: "OverdueCommitmentRule",
    matches: (ctx) =>
        ctx.remainingAmount > 0 &&
        isBefore(startOfDay(ctx.dueDate), startOfDay(ctx.today)),
    resolve: () => "OVERDUE",
};

export const PartialCommitmentRule: ICycleStatusRule<CommitmentCycleStatusEnum> = {
    name: "PartialCommitmentRule",
    matches: (ctx) => ctx.paidAmount > 0 && ctx.paidAmount < ctx.totalAmount,
    resolve: () => "PARTIAL",
};

export const PendingCommitmentRule: ICycleStatusRule<CommitmentCycleStatusEnum> = {
    name: "PendingCommitmentRule",
    matches: (ctx) =>
        ctx.paidAmount === 0 &&
        ctx.remainingAmount > 0 &&
        (isAfter(startOfDay(ctx.today), startOfDay(ctx.endsAt)) ||
            ctx.recognizedAmount > 0),
    resolve: () => "PENDING",
};

// ============================================================================
// Regras Atômicas para Wizard de Quitação de Obrigações (CycleOption / CycleView)
// ============================================================================

export const ZeroEntriesObligationRule: ICycleStatusRule<CycleStatus> = {
    name: "ZeroEntriesObligationRule",
    matches: (ctx) => ctx.totalEntriesCount === 0,
    resolve: (ctx) => {
        if (
            ctx.currentPeriodStart &&
            isBefore(
                startOfDay(ctx.dueDate),
                startOfDay(ctx.currentPeriodStart)
            )
        ) {
            return "UNRECORDED";
        }
        return "PROJECTED";
    },
};

export const SettledObligationRule: ICycleStatusRule<CycleStatus> = {
    name: "SettledObligationRule",
    matches: (ctx) => ctx.totalAmount > 0 && ctx.paidAmount >= ctx.totalAmount,
    resolve: () => "SETTLED",
};

export const PartialObligationRule: ICycleStatusRule<CycleStatus> = {
    name: "PartialObligationRule",
    matches: (ctx) => ctx.paidAmount > 0 && ctx.paidAmount < ctx.totalAmount,
    resolve: () => "PARTIAL",
};

// ============================================================================
// Fábrica de Motores de Regras (Rules Pattern Engine)
// ============================================================================

export class CycleStatusRuleEngine {
    static forCommitmentCycle(): CycleStatusEvaluator<CommitmentCycleStatusEnum> {
        return new CycleStatusEvaluator<CommitmentCycleStatusEnum>(
            [
                ZeroEntriesCommitmentRule,
                SettledCommitmentRule,
                TransferredCommitmentRule,
                OverdueCommitmentRule,
                PartialCommitmentRule,
                PendingCommitmentRule,
            ],
            "OPEN"
        );
    }

    static forObligationCycle(): CycleStatusEvaluator<CycleStatus> {
        return new CycleStatusEvaluator<CycleStatus>(
            [
                ZeroEntriesObligationRule,
                SettledObligationRule,
                PartialObligationRule,
            ],
            "OPEN"
        );
    }
}

