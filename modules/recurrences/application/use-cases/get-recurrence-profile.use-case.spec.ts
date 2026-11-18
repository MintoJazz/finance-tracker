import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { IRecurrenceQueries } from "../interfaces/recurrence-queries.interface";
import { GetRecurrenceProfileUseCase } from "./get-recurrence-profile.use-case";
import type { RecurrenceListItem } from "../../models/schemas/recurrence-item.schema";

describe("GetRecurrenceProfileUseCase", () => {
    const mockSession: SessionPayload = {
        contextId: 100,
        partyId: 5,
    };

    const mockRecurrenceItem: RecurrenceListItem = {
        balanceId: 42,
        name: "Academia Smart Fit",
        direction: "DEBIT",
        frequency: "MONTHLY",
        interval: 1,
        dueDay: 15,
        dueMonth: null,
        currentAmount: 14990,
        nextDueDate: "2026-12-15",
        startsAt: "2026-01-01",
        endsAt: null,
        isActive: true,
        isOverdue: false,
        isArchived: false,
        status: "ACTIVE",
        category: null,
        icon: "dumbbell",
        color: "#10b981",
    };

    it("retorna failure quando validação de espaço falhar", async () => {
        const mockAccessProvider: ISpaceAccessProvider = {
            execute: async () => failure("Contexto inválido"),
        };
        const mockQueries: IRecurrenceQueries = {
            listRecurrencesByContextId: async () => [],
            findRecurrenceById: async () => null,
        };

        const useCase = new GetRecurrenceProfileUseCase(
            mockQueries,
            mockAccessProvider
        );
        const result = await useCase.execute({
            session: mockSession,
            balanceId: 42,
        });

        assert.equal(result.success, false);
        if (!result.success) {
            assert.equal(result.error, "Contexto inválido");
        }
    });

    it("retorna failure quando canViewBalances for falsa", async () => {
        const mockAccessProvider: ISpaceAccessProvider = {
            execute: async () =>
                success({
                    canViewBalances: false,
                    canManageBalances: false,
                    canManageSettings: false,
                    isOwner: false,
                    isShared: false,
                }),
        };
        const mockQueries: IRecurrenceQueries = {
            listRecurrencesByContextId: async () => [],
            findRecurrenceById: async () => mockRecurrenceItem,
        };

        const useCase = new GetRecurrenceProfileUseCase(
            mockQueries,
            mockAccessProvider
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

    it("retorna failure quando a recorrência não for encontrada", async () => {
        const mockAccessProvider: ISpaceAccessProvider = {
            execute: async () =>
                success({
                    canViewBalances: true,
                    canManageBalances: false,
                    canManageSettings: false,
                    isOwner: false,
                    isShared: false,
                }),
        };
        const mockQueries: IRecurrenceQueries = {
            listRecurrencesByContextId: async () => [],
            findRecurrenceById: async () => null,
        };

        const useCase = new GetRecurrenceProfileUseCase(
            mockQueries,
            mockAccessProvider
        );
        const result = await useCase.execute({
            session: mockSession,
            balanceId: 999,
        });

        assert.equal(result.success, false);
        if (!result.success) {
            assert.equal(result.error, "Recorrência não encontrada.");
        }
    });

    it("retorna success com os metadados da recorrência", async () => {
        const mockAccessProvider: ISpaceAccessProvider = {
            execute: async () =>
                success({
                    canViewBalances: true,
                    canManageBalances: false,
                    canManageSettings: false,
                    isOwner: false,
                    isShared: false,
                }),
        };
        const mockQueries: IRecurrenceQueries = {
            listRecurrencesByContextId: async () => [],
            findRecurrenceById: async () => mockRecurrenceItem,
        };

        const useCase = new GetRecurrenceProfileUseCase(
            mockQueries,
            mockAccessProvider
        );
        const result = await useCase.execute({
            session: mockSession,
            balanceId: 42,
        });

        assert.equal(result.success, true);
        if (result.success) {
            assert.equal(result.data.balanceId, 42);
            assert.equal(result.data.name, "Academia Smart Fit");
            assert.equal(result.data.currentAmount, 14990);
            assert.equal(result.data.description, null);
        }
    });
});

