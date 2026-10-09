import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GetCommitmentCyclesUseCase } from "./get-commitment-cycles.use-case";
import { CycleEngineService } from "../services/cycle-engine.service";
import { ICommitmentCyclesQueries } from "../types/commitment-cycles-queries.interface";
import { IPlanningAccessProvider } from "../types/space-access-provider.interface";
import { failure, success } from "@/types/result.types";
import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { AgreementCycleSourceData } from "../types/commitment-cycle-engine.interface";

describe("GetCommitmentCyclesUseCase", () => {
    const engine = new CycleEngineService();

    const mockSession: SessionPayload = {
        partyId: 10,
        contextId: 100,
    };

    it("should return failure when access provider denies permission", async () => {
        const mockAccess: IPlanningAccessProvider = {
            async execute() {
                return failure("Acesso negado");
            },
        };

        const mockQueries: ICommitmentCyclesQueries = {
            async findCycleSources() {
                return [];
            },
        };

        const useCase = new GetCommitmentCyclesUseCase(mockQueries, mockAccess, engine);
        const result = await useCase.execute(
            {
                session: mockSession,
                pageRequest: { page: 1, pageSize: 10 },
            },
            new Date("2026-10-15T00:00:00.000Z")
        );

        assert.equal(result.success, false);
        assert.equal(result.error, "Acesso negado");
    });

    it("should return failure when canViewPlanning is false", async () => {
        const mockAccess: IPlanningAccessProvider = {
            async execute() {
                return success({
                    canViewPlanning: false,
                    canManagePlanning: false,
                });
            },
        };

        const mockQueries: ICommitmentCyclesQueries = {
            async findCycleSources() {
                return [];
            },
        };

        const useCase = new GetCommitmentCyclesUseCase(mockQueries, mockAccess, engine);
        const result = await useCase.execute(
            {
                session: mockSession,
                pageRequest: { page: 1, pageSize: 10 },
            },
            new Date("2026-10-15T00:00:00.000Z")
        );

        assert.equal(result.success, false);
        assert.match(result.error!, /Sem permissão/);
    });

    it("should successfully execute pipeline: access -> queries -> project -> summarize -> filter -> paginate", async () => {
        const mockAccess: IPlanningAccessProvider = {
            async execute() {
                return success({
                    canViewPlanning: true,
                    canManagePlanning: true,
                });
            },
        };

        const mockSources: AgreementCycleSourceData[] = [
            {
                agreementId: 1,
                balanceId: 10,
                balanceName: "Internet Fibra",
                balanceType: "COMMITMENT",
                includeInProjection: true,
                startsAt: new Date("2026-01-01T00:00:00.000Z"),
                endsAt: null,
                amountLog: [{ amount: 15000, effectiveAt: new Date("2026-01-01T00:00:00.000Z") }],
                rules: [
                    {
                        id: 1,
                        agreementId: 1,
                        effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
                        frequency: "MONTHLY",
                        interval: 1,
                        closingDay: null,
                        dueDay: 10,
                        entries: [],
                    },
                ],
            },
            {
                agreementId: 2,
                balanceId: 20,
                balanceName: "Energia Elétrica",
                balanceType: "COMMITMENT",
                includeInProjection: true,
                startsAt: new Date("2026-01-01T00:00:00.000Z"),
                endsAt: null,
                amountLog: [{ amount: 30000, effectiveAt: new Date("2026-01-01T00:00:00.000Z") }],
                rules: [
                    {
                        id: 2,
                        agreementId: 2,
                        effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
                        frequency: "MONTHLY",
                        interval: 1,
                        closingDay: null,
                        dueDay: 20,
                        entries: [],
                    },
                ],
            },
        ];

        let capturedWindow: { from: Date; to: Date } | null = null;
        const mockQueries: ICommitmentCyclesQueries = {
            async findCycleSources(_contextId, window) {
                capturedWindow = window;
                return mockSources;
            },
        };

        const useCase = new GetCommitmentCyclesUseCase(mockQueries, mockAccess, engine);
        const result = await useCase.execute(
            {
                session: mockSession,
                pageRequest: { page: 1, pageSize: 1 }, // pageSize 1 para testar paginação
                filter: {
                    from: "2026-10-01",
                    to: "2026-10-31",
                    q: "Fibra", // Filtra somente "Fibra"
                },
            },
            new Date("2026-10-15T00:00:00.000Z")
        );

        assert.equal(result.success, true);
        assert.ok(capturedWindow);

        const data = result.data!;
        // Resumo abrange a janela inteira (Internet 15000 + Energia 30000 = 45000), ignorando filtro q
        assert.equal(data.summary.totalAmount, 45000);

        // Ciclos filtrados trazem apenas Internet Fibra
        assert.equal(data.cycles.total, 1);
        assert.equal(data.cycles.data.length, 1);
        assert.equal(data.cycles.data[0].balanceName, "Internet Fibra");
        assert.equal(data.cycles.pageCount, 1);
    });
});
