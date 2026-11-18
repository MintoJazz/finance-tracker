import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { IRecurrenceQueries } from "../interfaces/recurrence-queries.interface";
import { GetContextRecurrencesUseCase } from "./get-context-recurrences.use-case";
import type { RecurrenceListItem } from "../../models/schemas/recurrence-item.schema";

describe("GetContextRecurrencesUseCase", () => {
    const mockSession: SessionPayload = {
        contextId: 100,
        partyId: 5,
    };

    const mockRecurrenceItem: RecurrenceListItem = {
        balanceId: 1,
        name: "Aluguel",
        direction: "DEBIT",
        frequency: "MONTHLY",
        interval: 1,
        dueDay: 5,
        dueMonth: null,
        currentAmount: 250000,
        nextDueDate: "2026-12-05",
        isActive: true,
        isOverdue: false,
        isArchived: false,
        status: "ACTIVE",
        category: null,
        icon: null,
        color: null,
    };

    it("retorna failure quando acesso ao espaço falhar", async () => {
        const mockAccessProvider: ISpaceAccessProvider = {
            execute: async () => failure("Contexto não encontrado"),
        };
        const mockQueries: IRecurrenceQueries = {
            listRecurrencesByContextId: async () => [],
            findRecurrenceById: async () => null,
        };

        const useCase = new GetContextRecurrencesUseCase(
            mockQueries,
            mockAccessProvider
        );
        const result = await useCase.execute({ session: mockSession });

        assert.equal(result.success, false);
        if (!result.success) {
            assert.equal(result.error, "Contexto não encontrado");
        }
    });

    it("retorna failure quando permissão canViewBalances for falsa", async () => {
        const mockAccessProvider: ISpaceAccessProvider = {
            execute: async () =>
                success({
                    canViewBalances: false,
                    canManageBalances: false,
                }),
        };
        const mockQueries: IRecurrenceQueries = {
            listRecurrencesByContextId: async () => [],
            findRecurrenceById: async () => null,
        };

        const useCase = new GetContextRecurrencesUseCase(
            mockQueries,
            mockAccessProvider
        );
        const result = await useCase.execute({ session: mockSession });

        assert.equal(result.success, false);
        if (!result.success) {
            assert.match(result.error, /Sem permissão para visualizar/);
        }
    });

    it("retorna success com a lista de recorrências quando o usuário tem permissão", async () => {
        let calledContextId = 0;
        const mockAccessProvider: ISpaceAccessProvider = {
            execute: async () =>
                success({
                    canViewBalances: true,
                    canManageBalances: true,
                }),
        };
        const mockQueries: IRecurrenceQueries = {
            listRecurrencesByContextId: async (contextId) => {
                calledContextId = contextId;
                return [mockRecurrenceItem];
            },
            findRecurrenceById: async () => null,
        };

        const useCase = new GetContextRecurrencesUseCase(
            mockQueries,
            mockAccessProvider
        );
        const result = await useCase.execute({ session: mockSession });

        assert.equal(result.success, true);
        assert.equal(calledContextId, mockSession.contextId);
        if (result.success) {
            assert.equal(result.data.length, 1);
            assert.equal(result.data[0].name, "Aluguel");
        }
    });
});
