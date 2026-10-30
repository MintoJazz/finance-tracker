import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AdjustContractLimitsUseCase } from "./adjust-contract-limits.use-case";
import {
    ContractAdjustmentData,
    IContractRepository,
    AdjustContractLimitsRepositoryDTO,
} from "@/modules/contracts/application/interfaces/contract-repository.interface";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { CycleEngineService } from "@/modules/cycles/application/services/cycle-engine.service";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";

describe("AdjustContractLimitsUseCase", () => {
    const mockSession: SessionPayload = {
        userId: 1,
        contextId: 10,
        partyId: 1,
    } as any;

    const mockContract: ContractAdjustmentData = {
        id: 1,
        balanceId: 100,
        name: "Internet Fibra",
        balanceType: "PAYABLE",
        startsAt: new Date(2026, 0, 1),
        endsAt: null,
        includeInProjection: true,
        isArchived: false,
        rules: [
            {
                id: 1,
                effectiveFrom: new Date(2026, 0, 1),
                frequency: "MONTHLY",
                interval: 1,
                dueDay: 10,
                closingDay: null,
            },
        ],
        amountEntries: [
            {
                id: 1,
                amount: 10000, // R$ 100,00
                effectiveAt: new Date(2026, 0, 1),
                reason: "Valor Inicial",
            },
        ],
    };

    it("should calculate delta and insert entry for IMMEDIATE scope", async () => {
        let insertedData: AdjustContractLimitsRepositoryDTO | null = null;
        const repo: IContractRepository = {
            findContractForAdjustment: async () => mockContract,
            adjustContractLimits: async (
                _id: number,
                _contextId: number,
                data: AdjustContractLimitsRepositoryDTO
            ) => {
                insertedData = data;
            },
        } as any;
        const access: ISpaceAccessProvider = {
            execute: async () => ({ success: true, data: { canManageBalances: true } as any }),
        };
        const cycleEngine = new CycleEngineService();

        const useCase = new AdjustContractLimitsUseCase(repo, access, cycleEngine);
        const refNow = new Date(2026, 5, 15); // Junho 2026

        const result = await useCase.execute({
            session: mockSession,
            contractId: 1,
            data: {
                value: 12000, // R$ 120,00 (delta = +2000)
                effectiveScope: "IMMEDIATE",
                effectiveDate: null,
            },
            now: refNow,
        });

        assert.equal(result.success, true);
        assert.ok(insertedData);
        const saved = insertedData as AdjustContractLimitsRepositoryDTO;
        assert.equal(saved.amount, 2000);
        assert.equal(saved.reason, "Ajuste de limite");
    });

    it("should not insert entry when delta is 0", async () => {
        let inserted = false;
        const repo: IContractRepository = {
            findContractForAdjustment: async () => mockContract,
            adjustContractLimits: async () => {
                inserted = true;
            },
        } as any;
        const access: ISpaceAccessProvider = {
            execute: async () => ({ success: true, data: { canManageBalances: true } as any }),
        };
        const cycleEngine = new CycleEngineService();

        const useCase = new AdjustContractLimitsUseCase(repo, access, cycleEngine);
        const result = await useCase.execute({
            session: mockSession,
            contractId: 1,
            data: {
                value: 10000, // Mesmo valor, delta = 0
                effectiveScope: "IMMEDIATE",
                effectiveDate: null,
            },
            now: new Date(2026, 5, 15),
        });

        assert.equal(result.success, true);
        assert.equal(inserted, false);
    });

    it("should calculate target date from next cycle when scope is NEXT_CYCLE", async () => {
        let insertedData: AdjustContractLimitsRepositoryDTO | null = null;
        const repo: IContractRepository = {
            findContractForAdjustment: async () => mockContract,
            adjustContractLimits: async (
                _id: number,
                _contextId: number,
                data: AdjustContractLimitsRepositoryDTO
            ) => {
                insertedData = data;
            },
        } as any;
        const access: ISpaceAccessProvider = {
            execute: async () => ({ success: true, data: { canManageBalances: true } as any }),
        };
        const cycleEngine = new CycleEngineService();

        const useCase = new AdjustContractLimitsUseCase(repo, access, cycleEngine);
        const refNow = new Date(2026, 5, 15); // 15 de Junho de 2026

        const result = await useCase.execute({
            session: mockSession,
            contractId: 1,
            data: {
                value: 15000,
                effectiveScope: "NEXT_CYCLE",
                effectiveDate: null,
            },
            now: refNow,
        });

        assert.equal(result.success, true);
        assert.ok(insertedData);
        const saved = insertedData as AdjustContractLimitsRepositoryDTO;
        assert.equal(saved.amount, 5000);
        // O próximo ciclo após 15 de junho para contrato mensal com vencimento dia 10 é Julho
        assert.ok(saved.effectiveAt >= new Date(2026, 6, 1));
    });
});
