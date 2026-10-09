import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GetAgreementDetailUseCase } from "./get-agreement-detail.use-case";
import { CycleEngineService } from "../services/cycle-engine.service";
import {
    AgreementEntityData,
    IAgreementDetailQueries,
} from "../types/agreement-detail-queries.interface";
import { IPlanningAccessProvider } from "../types/space-access-provider.interface";
import { failure, success } from "@/types/result.types";
import { SessionPayload } from "@/modules/identity/infra/cryptography/jwt-utils";
import { AgreementCycleSourceData } from "../types/commitment-cycle-engine.interface";

describe("GetAgreementDetailUseCase", () => {
    const cycleEngine = new CycleEngineService();

    const mockSession: SessionPayload = {
        partyId: 10,
        contextId: 100,
    };

    const mockAgreementEntity: AgreementEntityData = {
        id: 1,
        balanceId: 50,
        balanceName: "Aluguel Apartamento",
        balanceType: "COMMITMENT",
        includeInProjection: true,
        startsAt: new Date(2026, 0, 1),
        endsAt: null,
        isArchived: false,
        rule: {
            id: 101,
            frequency: "MONTHLY",
            interval: 1,
            closingDay: null,
            dueDay: 10,
            effectiveFrom: new Date(2026, 0, 1),
        },
        amountHistory: [
            {
                id: 1,
                amount: 250000,
                effectiveAt: new Date(2026, 0, 1),
                reason: "Contrato inicial",
                createdAt: new Date(2026, 0, 1),
            },
            {
                id: 2,
                amount: 30000,
                effectiveAt: new Date(2026, 6, 1),
                reason: "Reajuste IGPM",
                createdAt: new Date(2026, 6, 1),
            },
        ],
    };

    const mockCycleSource: AgreementCycleSourceData = {
        agreementId: 1,
        balanceId: 50,
        balanceName: "Aluguel Apartamento",
        balanceType: "COMMITMENT",
        includeInProjection: true,
        startsAt: new Date(2026, 0, 1),
        endsAt: null,
        amountLog: [
            { amount: 250000, effectiveAt: new Date(2026, 0, 1) },
            { amount: 30000, effectiveAt: new Date(2026, 6, 1) },
        ],
        rules: [
            {
                id: 101,
                agreementId: 1,
                effectiveFrom: new Date(2026, 0, 1),
                frequency: "MONTHLY",
                interval: 1,
                closingDay: null,
                dueDay: 10,
                entries: [],
            },
        ],
    };

    it("should return failure when access provider denies permission", async () => {
        const mockAccess: IPlanningAccessProvider = {
            async execute() {
                return failure("Acesso negado");
            },
        };

        const mockQueries: IAgreementDetailQueries = {
            async findAgreementDetail() {
                return null;
            },
            async findAgreementCycleSource() {
                return null;
            },
        };

        const useCase = new GetAgreementDetailUseCase(
            mockQueries,
            mockAccess,
            cycleEngine
        );

        const result = await useCase.execute({
            session: mockSession,
            input: { agreementId: 1 },
        });

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

        const mockQueries: IAgreementDetailQueries = {
            async findAgreementDetail() {
                return null;
            },
            async findAgreementCycleSource() {
                return null;
            },
        };

        const useCase = new GetAgreementDetailUseCase(
            mockQueries,
            mockAccess,
            cycleEngine
        );

        const result = await useCase.execute({
            session: mockSession,
            input: { agreementId: 1 },
        });

        assert.equal(result.success, false);
        assert.match(result.error!, /Sem permissão/);
    });

    it("should return failure when agreement is not found", async () => {
        const mockAccess: IPlanningAccessProvider = {
            async execute() {
                return success({
                    canViewPlanning: true,
                    canManagePlanning: true,
                });
            },
        };

        const mockQueries: IAgreementDetailQueries = {
            async findAgreementDetail() {
                return null;
            },
            async findAgreementCycleSource() {
                return null;
            },
        };

        const useCase = new GetAgreementDetailUseCase(
            mockQueries,
            mockAccess,
            cycleEngine
        );

        const result = await useCase.execute({
            session: mockSession,
            input: { agreementId: 999 },
        });

        assert.equal(result.success, false);
        assert.equal(result.error, "Compromisso não encontrado.");
    });

    it("should return agreement detail with calculated currentExpectedValue and projected cycles", async () => {
        const mockAccess: IPlanningAccessProvider = {
            async execute() {
                return success({
                    canViewPlanning: true,
                    canManagePlanning: true,
                });
            },
        };

        const mockQueries: IAgreementDetailQueries = {
            async findAgreementDetail(_contextId, identifier) {
                if (identifier.agreementId === 1) return mockAgreementEntity;
                return null;
            },
            async findAgreementCycleSource(_contextId, identifier) {
                if (identifier.agreementId === 1) return mockCycleSource;
                return null;
            },
        };

        const useCase = new GetAgreementDetailUseCase(
            mockQueries,
            mockAccess,
            cycleEngine
        );

        // Referência em Outubro 2026 (após reajuste de Julho 2026)
        const refDate = new Date(2026, 9, 15);

        const result = await useCase.execute({
            session: mockSession,
            input: {
                agreementId: 1,
                from: "2026-09-01",
                to: "2026-11-30",
            },
            referenceDate: refDate,
        });

        assert.equal(result.success, true);
        assert.ok(result.data);
        assert.equal(result.data.id, 1);
        assert.equal(result.data.name, "Aluguel Apartamento");
        // Soma dos deltas: 250000 + 30000 = 280000
        assert.equal(result.data.currentExpectedValue, 280000);
        assert.equal(result.data.amountHistory.length, 2);

        // Deve projetar 3 ciclos (Setembro, Outubro, Novembro)
        assert.equal(result.data.cycles.length, 3);
        assert.equal(result.data.cycles[0].label, "Setembro 2026");
        assert.equal(result.data.cycles[1].label, "Outubro 2026");
        assert.equal(result.data.cycles[2].label, "Novembro 2026");
    });
});
