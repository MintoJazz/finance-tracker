import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { format } from "date-fns";
import { success } from "@/types/result.types";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type {
    AggregatedCycleRow,
    FindCycleRulesInWindowParams,
    ICycleQueries,
} from "@/modules/cycles/application/interfaces/cycle-queries.interface";
import type { CycleRuleRecord } from "@/modules/cycles/application/services/cycle-engine.registry";
import type { RecurrenceProfile } from "../../models/schemas/recurrence-profile.schema";
import { GetRecurrenceProfileUseCase } from "./get-recurrence-profile.use-case";
import { GetRecurrenceCyclesUseCase } from "./get-recurrence-cycles.use-case";

describe("GetRecurrenceCyclesUseCase", () => {
    const mockSession: SessionPayload = {
        contextId: 100,
        partyId: 5,
    };

    const mockProfileContinuous: RecurrenceProfile = {
        balanceId: 42,
        name: "Internet Fibra",
        direction: "DEBIT",
        frequency: "MONTHLY",
        interval: 1,
        dueDay: 12,
        dueMonth: null,
        currentAmount: 12990,
        nextDueDate: "2026-12-12",
        startsAt: "2026-01-01",
        endsAt: null,
        isActive: true,
        isOverdue: false,
        isArchived: false,
        status: "ACTIVE",
        category: null,
        icon: "wifi",
        color: "#3b82f6",
    };

    const mockProfileTerm: RecurrenceProfile = {
        ...mockProfileContinuous,
        balanceId: 99,
        name: "Empréstimo Caixa (12 parcelas)",
        startsAt: "2026-01-01",
        endsAt: "2026-12-31",
    };

    const mockRule: CycleRuleRecord = {
        id: 1,
        agreementId: 42,
        dueDay: 12,
        dueMonth: null,
        closingDay: null,
        closingMonth: null,
        effectiveFrom: new Date("2026-01-01"),
    };

    const mockAggregatedRow: AggregatedCycleRow = {
        from: new Date("2026-01-01"),
        to: new Date("2026-01-31"),
        dueDate: new Date("2026-01-12"),
        closingDate: null,
        label: "Janeiro 2026",
        ruleId: 1,
        movementsCount: 1,
        isConsolidated: true,
        recognizedAmount: 12990,
        paidAmount: 12990,
        transferredAmount: 0,
        remainingAmount: 0,
        totalAmount: 12990,
        settlementDate: new Date("2026-01-10"),
        hasReceipt: true,
        isOverdue: false,
        status: "PAID",
    };

    const createMockQueries = (overrides?: Partial<ICycleQueries>): ICycleQueries => ({
        findAgreementContext: async () => null,
        findCycleRulesInWindow: async () => [mockRule],
        aggregateCycles: async () => [mockAggregatedRow],
        ...overrides,
    });

    const createAccessProvider = (canView = true): ISpaceAccessProvider => ({
        execute: async () =>
            success({
                canViewBalances: canView,
                canManageBalances: false,
                canManageSettings: false,
                isOwner: false,
                isShared: false,
            }),
    });

    const createMockProfileUseCase = (profile: RecurrenceProfile = mockProfileContinuous): GetRecurrenceProfileUseCase => {
        return {
            execute: async () => success(profile),
        } as unknown as GetRecurrenceProfileUseCase;
    };

    it("retorna failure quando permissão canViewBalances for falsa", async () => {
        const useCase = new GetRecurrenceCyclesUseCase(
            createMockProfileUseCase(),
            createMockQueries(),
            createAccessProvider(false)
        );

        const result = await useCase.execute({
            session: mockSession,
            balanceId: 42,
        });

        assert.equal(result.success, false);
        if (!result.success) {
            assert.match(result.error, /permissão/i);
        }
    });

    it("quando endsAt não é nulo: define horizonte [startsAt, endsAt] sem paginação (hasPagination: false)", async () => {
        let capturedWindowParams: FindCycleRulesInWindowParams | null = null;

        const queries = createMockQueries({
            findCycleRulesInWindow: async (p) => {
                capturedWindowParams = p;
                return [mockRule];
            },
        });

        const useCase = new GetRecurrenceCyclesUseCase(
            createMockProfileUseCase(mockProfileTerm),
            queries,
            createAccessProvider(true)
        );

        const result = await useCase.execute({
            session: mockSession,
            balanceId: 99,
            filters: {},
            today: new Date("2026-06-15"),
        });

        assert.equal(result.success, true);
        if (result.success) {
            assert.equal(result.data.horizon.hasPagination, false);
            assert.equal(result.data.horizon.canPrev, false);
            assert.equal(result.data.horizon.canNext, false);
            assert.ok(capturedWindowParams !== null);
        }
    });

    it("quando from e to são fornecidos: define período customizado com isCustom: true", async () => {
        const useCase = new GetRecurrenceCyclesUseCase(
            createMockProfileUseCase(mockProfileContinuous),
            createMockQueries(),
            createAccessProvider(true)
        );

        const result = await useCase.execute({
            session: mockSession,
            balanceId: 42,
            filters: {
                from: "2026-03-01",
                to: "2026-05-31",
            },
            today: new Date("2026-06-15"),
        });

        assert.equal(result.success, true);
        if (result.success) {
            assert.equal(result.data.horizon.isCustom, true);
            assert.equal(result.data.horizon.from, "2026-03-01");
            assert.equal(result.data.horizon.to, "2026-05-31");
            assert.equal(result.data.horizon.hasPagination, true);
        }
    });

    it("caso padrão: calcula ano civil via CycleHorizonCalculator e offset", async () => {
        const useCase = new GetRecurrenceCyclesUseCase(
            createMockProfileUseCase(mockProfileContinuous),
            createMockQueries(),
            createAccessProvider(true)
        );

        const result = await useCase.execute({
            session: mockSession,
            balanceId: 42,
            filters: {
                offset: 0,
            },
            today: new Date("2026-06-15"),
        });

        assert.equal(result.success, true);
        if (result.success) {
            assert.equal(result.data.horizon.label, "2026");
            assert.equal(result.data.horizon.offset, 0);
            assert.equal(result.data.horizon.canPrev, true);
            assert.equal(result.data.horizon.canNext, true);
            assert.equal(result.data.horizon.hasPagination, true);
        }
    });

    const weeklyCases: Array<[string, number, string, string]> = [
        ["2026-02-10", 0, "1º Tri 2026 (jan–mar)", "2026-01-01"],
        ["2026-06-15", 0, "2º Tri 2026 (abr–jun)", "2026-04-01"],
        ["2026-08-15", 0, "3º Tri 2026 (jul–set)", "2026-07-01"],
        ["2026-11-17", 0, "4º Tri 2026 (out–dez)", "2026-10-01"],
        ["2026-11-17", 1, "1º Tri 2027 (jan–mar)", "2027-01-01"],
        ["2026-02-10", -1, "4º Tri 2025 (out–dez)", "2025-10-01"],
    ];

    for (const [today, offset, label, from] of weeklyCases) {
        it(`semanal: ${today} offset ${offset} => ${label}`, async () => {
            let capturedFrom: Date | undefined;
            const useCase = new GetRecurrenceCyclesUseCase(
                createMockProfileUseCase({
                    ...mockProfileContinuous,
                    frequency: "WEEKLY",
                }),
                createMockQueries({
                    findCycleRulesInWindow: async (params) => {
                        capturedFrom = params.from;
                        return [];
                    },
                }),
                createAccessProvider(true)
            );

            const result = await useCase.execute({
                session: mockSession,
                balanceId: 42,
                filters: { offset },
                today: new Date(`${today}T12:00:00`),
            });

            assert.equal(result.success, true);
            if (result.success) {
                assert.equal(result.data.horizon.label, label);
                assert.equal(result.data.horizon.prevOffset, offset - 1);
                assert.equal(result.data.horizon.nextOffset, offset + 1);
            }
            assert.equal(
                capturedFrom && format(capturedFrom, "yyyy-MM-dd"),
                from
            );
        });
    }

    it("quando nenhuma regra for encontrada, retorna lista vazia sem erro", async () => {
        const queries = createMockQueries({
            findCycleRulesInWindow: async () => [],
        });

        const useCase = new GetRecurrenceCyclesUseCase(
            createMockProfileUseCase(mockProfileContinuous),
            queries,
            createAccessProvider(true)
        );

        const result = await useCase.execute({
            session: mockSession,
            balanceId: 42,
            filters: {},
            today: new Date("2026-06-15"),
        });

        assert.equal(result.success, true);
        if (result.success) {
            assert.deepEqual(result.data.cycles, []);
        }
    });

    it("mapeia as linhas agregadas para CycleItem corretamente", async () => {
        const useCase = new GetRecurrenceCyclesUseCase(
            createMockProfileUseCase(mockProfileContinuous),
            createMockQueries(),
            createAccessProvider(true)
        );

        const result = await useCase.execute({
            session: mockSession,
            balanceId: 42,
            filters: {
                status: "PAID",
            },
            today: new Date("2026-06-15"),
        });

        assert.equal(result.success, true);
        if (result.success) {
            assert.equal(result.data.cycles.length, 1);
            const cycle = result.data.cycles[0];
            assert.equal(cycle.label, "Janeiro 2026");
            assert.equal(cycle.status, "PAID");
            assert.equal(cycle.totalAmount, 12990);
            assert.equal(cycle.paidAmount, 12990);
            assert.equal(cycle.remainingAmount, 0);
            assert.equal(cycle.balanceId, 42);
            assert.equal(cycle.balanceName, "Internet Fibra");
        }
    });
});
