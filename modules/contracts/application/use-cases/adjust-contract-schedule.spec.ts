import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AdjustContractScheduleUseCase } from "./adjust-contract-schedule.use-case";
import {
    ContractAdjustmentData,
    IContractRepository,
    AdjustContractScheduleRepositoryDTO,
} from "@/modules/contracts/application/interfaces/contract-repository.interface";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { CycleEngineService } from "@/modules/cycles/application/services/cycle-engine.service";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";

describe("AdjustContractScheduleUseCase", () => {
    const mockSession: SessionPayload = {
        userId: 1,
        contextId: 10,
        partyId: 1,
    } as any;

    const mockContract: ContractAdjustmentData = {
        id: 1,
        balanceId: 100,
        name: "Plano de Saúde",
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
                dueDay: 5,
                closingDay: null,
            },
        ],
        amountEntries: [
            {
                id: 1,
                amount: 30000,
                effectiveAt: new Date(2026, 0, 1),
                reason: "Valor Inicial",
            },
        ],
    };

    it("should adjust schedule with IMMEDIATE scope", async () => {
        let savedData: AdjustContractScheduleRepositoryDTO | null = null;
        const repo: IContractRepository = {
            findContractForAdjustment: async () => mockContract,
            adjustContractSchedule: async (
                _id: number,
                _contextId: number,
                data: AdjustContractScheduleRepositoryDTO
            ) => {
                savedData = data;
            },
        } as any;
        const access: ISpaceAccessProvider = {
            execute: async () => ({ success: true, data: { canManageBalances: true } as any }),
        };
        const cycleEngine = new CycleEngineService();

        const useCase = new AdjustContractScheduleUseCase(repo, access, cycleEngine);
        const refNow = new Date(2026, 4, 10);

        const result = await useCase.execute({
            session: mockSession,
            contractId: 1,
            data: {
                frequency: "MONTHLY",
                hasCustomClosingDay: true,
                schedule: {
                    dueDay: 20,
                    closingDay: 13,
                    dueMonth: null,
                    closingMonth: null,
                },
                effectiveScope: "IMMEDIATE",
                effectiveDate: null,
            },
            now: refNow,
        });

        assert.equal(result.success, true);
        assert.ok(savedData);
        const saved = savedData as AdjustContractScheduleRepositoryDTO;
        assert.equal(saved.dueDay, 20);
        assert.equal(saved.closingDay, 13);
        assert.equal(saved.frequency, "MONTHLY");
    });

    it("should adjust schedule with NEXT_CYCLE scope", async () => {
        let savedData: AdjustContractScheduleRepositoryDTO | null = null;
        const repo: IContractRepository = {
            findContractForAdjustment: async () => mockContract,
            adjustContractSchedule: async (
                _id: number,
                _contextId: number,
                data: AdjustContractScheduleRepositoryDTO
            ) => {
                savedData = data;
            },
        } as any;
        const access: ISpaceAccessProvider = {
            execute: async () => ({ success: true, data: { canManageBalances: true } as any }),
        };
        const cycleEngine = new CycleEngineService();

        const useCase = new AdjustContractScheduleUseCase(repo, access, cycleEngine);
        const refNow = new Date(2026, 4, 10); // 10 de Maio de 2026

        const result = await useCase.execute({
            session: mockSession,
            contractId: 1,
            data: {
                frequency: "MONTHLY",
                hasCustomClosingDay: false,
                schedule: {
                    dueDay: 15,
                    closingDay: null,
                    dueMonth: null,
                    closingMonth: null,
                },
                effectiveScope: "NEXT_CYCLE",
                effectiveDate: null,
            },
            now: refNow,
        });

        assert.equal(result.success, true);
        assert.ok(savedData);
        const saved = savedData as AdjustContractScheduleRepositoryDTO;
        assert.equal(saved.dueDay, 15);
        assert.equal(saved.closingDay, null);
        assert.ok(saved.effectiveFrom >= new Date(2026, 5, 1));
    });
});
