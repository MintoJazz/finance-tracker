import { mock } from "node:test";
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type {
    ISpaceAccessProvider,
    SpaceAccessPermissions,
} from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success } from "@/types/result.types";
import type { CycleRuleRecord } from "../services/cycle-engine.registry";
import type { CycleWindowBoundaries } from "../services/cycle-window.engine";
import type {
    AgreementContextRecord,
    AggregateCyclesParams,
    AggregatedCycleRow,
    FindCycleRulesInWindowParams,
    ICycleQueries,
} from "../interfaces/cycle-queries.interface";

export const session: SessionPayload = { contextId: 100, partyId: 5 };

/** Data civil à meia-noite UTC, como chega das colunas `date` do $queryRaw. */
export const utcDay = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));

export const rule = (overrides: Partial<CycleRuleRecord> = {}): CycleRuleRecord => ({
    id: 1,
    agreementId: 9,
    dueDay: 10,
    dueMonth: null,
    closingDay: 3,
    closingMonth: null,
    effectiveFrom: new Date(2026, 0, 1),
    ...overrides,
});

export const agreementContext = (
    overrides: Partial<AgreementContextRecord> = {}
): AgreementContextRecord => ({
    balanceId: 9,
    balanceName: "Nubank",
    balanceType: "CREDIT",
    isActive: true,
    frequency: "MONTHLY",
    interval: 1,
    startsAt: new Date(2026, 0, 1),
    endsAt: null,
    ...overrides,
});

export const aggregatedRow = (overrides: Partial<AggregatedCycleRow> = {}): AggregatedCycleRow => ({
    from: utcDay(2026, 2, 4),
    to: utcDay(2026, 3, 3),
    dueDate: utcDay(2026, 3, 10),
    closingDate: utcDay(2026, 3, 3),
    label: "Março 2026",
    ruleId: 1,
    movementsCount: 4,
    isConsolidated: false,
    recognizedAmount: 12000,
    paidAmount: 2000,
    transferredAmount: 0,
    remainingAmount: 10000,
    totalAmount: 12000,
    settlementDate: null,
    hasReceipt: false,
    isOverdue: false,
    status: "PARTIAL",
    ...overrides,
});

interface SetupOptions {
    permissions?: SpaceAccessPermissions;
    accessError?: string;
    accessWithoutData?: boolean;
    agreement?: AgreementContextRecord | null;
    rules?: CycleRuleRecord[];
    rows?: AggregatedCycleRow[] | ((windows: CycleWindowBoundaries[]) => AggregatedCycleRow[]);
    queryThrows?: boolean;
}

/** Consultas e acesso falsos; registra as chamadas e os parâmetros recebidos. */
export function setupCycleQueries(options: SetupOptions = {}) {
    const calls: string[] = [];
    const ruleParams: FindCycleRulesInWindowParams[] = [];
    const aggregateParams: AggregateCyclesParams[] = [];
    const agreement = "agreement" in options ? options.agreement : agreementContext();

    const queries: ICycleQueries = {
        findAgreementContext: async (balanceId, contextId) => {
            if (options.queryThrows) throw new Error("db offline");
            calls.push(`agreement:${balanceId}:${contextId}`);
            return agreement ?? null;
        },
        findCycleRulesInWindow: async (params) => {
            calls.push("rules");
            ruleParams.push(params);
            return options.rules ?? [rule()];
        },
        aggregateCycles: async (params) => {
            calls.push("aggregate");
            aggregateParams.push(params);
            const rows = options.rows ?? [aggregatedRow()];
            return typeof rows === "function" ? rows(params.windows) : rows;
        },
    };

    const access = {
        execute: async () => {
            if (options.accessError) return failure(options.accessError);
            if (options.accessWithoutData) return { success: true, data: undefined } as never;
            return success(
                options.permissions ?? { canViewBalances: true, canManageBalances: false }
            );
        },
    } as ISpaceAccessProvider;

    return { queries, access, calls, ruleParams, aggregateParams };
}

export function silenceConsole() {
    mock.method(console, "warn", () => {});
    mock.method(console, "error", () => {});
}
