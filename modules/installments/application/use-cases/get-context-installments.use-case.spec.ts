import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success } from "@/types/result.types";
import { MOCK_INSTALLMENTS } from "../../infra/mock/installments.mock";
import { IInstallmentQueries } from "../interfaces/installment-queries.interface";
import { GetContextInstallmentsUseCase } from "./get-context-installments.use-case";

describe("GetContextInstallmentsUseCase", () => {
    const session: SessionPayload = { contextId: 100, partyId: 5 };

    it("retorna failure quando o acesso ao espaço falhar", async () => {
        const access: ISpaceAccessProvider = {
            execute: async () => failure("Contexto não encontrado"),
        };
        const queries: IInstallmentQueries = {
            listInstallmentsByContextId: async () => [],
            findInstallmentById: async () => null,
            listCardOptions: async () => [],
        };

        const result = await new GetContextInstallmentsUseCase(
            queries,
            access
        ).execute({ session });

        assert.equal(result.success, false);
        if (!result.success) assert.equal(result.error, "Contexto não encontrado");
    });

    it("retorna failure sem permissão canViewBalances", async () => {
        const access: ISpaceAccessProvider = {
            execute: async () =>
                success({ canViewBalances: false, canManageBalances: false }),
        };
        const queries: IInstallmentQueries = {
            listInstallmentsByContextId: async () => [],
            findInstallmentById: async () => null,
            listCardOptions: async () => [],
        };

        const result = await new GetContextInstallmentsUseCase(
            queries,
            access
        ).execute({ session });

        assert.equal(result.success, false);
        if (!result.success) assert.match(result.error, /Sem permissão/);
    });

    it("retorna a lista do contexto da sessão quando há permissão", async () => {
        let calledContextId = 0;
        const access: ISpaceAccessProvider = {
            execute: async () =>
                success({ canViewBalances: true, canManageBalances: true }),
        };
        const queries: IInstallmentQueries = {
            listInstallmentsByContextId: async (contextId) => {
                calledContextId = contextId;
                return [MOCK_INSTALLMENTS[0]];
            },
            findInstallmentById: async () => null,
            listCardOptions: async () => [],
        };

        const result = await new GetContextInstallmentsUseCase(
            queries,
            access
        ).execute({ session });

        assert.equal(result.success, true);
        assert.equal(calledContextId, session.contextId);
        if (result.success) assert.equal(result.data.length, 1);
    });
});
