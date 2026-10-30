import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RenameContractUseCase } from "./rename-contract.use-case";
import { IContractRepository } from "@/modules/contracts/application/interfaces/contract-repository.interface";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";

describe("RenameContractUseCase", () => {
    const mockSession: SessionPayload = {
        userId: 1,
        contextId: 10,
        partyId: 1,
    } as any;

    it("should fail if name is empty or whitespace", async () => {
        const repo: IContractRepository = {
            renameContract: async () => {},
        } as any;
        const access: ISpaceAccessProvider = {
            execute: async () => ({ success: true, data: { canManageBalances: true } as any }),
        };

        const useCase = new RenameContractUseCase(repo, access);
        const result = await useCase.execute({
            session: mockSession,
            contractId: 5,
            name: "   ",
        });

        assert.equal(result.success, false);
        assert.match(result.error ?? "", /não pode ser vazio/);
    });

    it("should fail if user has no permission to manage balances", async () => {
        const repo: IContractRepository = {
            renameContract: async () => {},
        } as any;
        const access: ISpaceAccessProvider = {
            execute: async () => ({ success: true, data: { canManageBalances: false } as any }),
        };

        const useCase = new RenameContractUseCase(repo, access);
        const result = await useCase.execute({
            session: mockSession,
            contractId: 5,
            name: "Novo Nome",
        });

        assert.equal(result.success, false);
        assert.match(result.error ?? "", /Sem permissão/);
    });

    it("should rename contract successfully when valid", async () => {
        let renamedWith: { id: number; contextId: number; name: string } | null = null;
        const repo: IContractRepository = {
            renameContract: async (id: number, contextId: number, name: string) => {
                renamedWith = { id, contextId, name };
            },
        } as any;
        const access: ISpaceAccessProvider = {
            execute: async () => ({ success: true, data: { canManageBalances: true } as any }),
        };

        const useCase = new RenameContractUseCase(repo, access);
        const result = await useCase.execute({
            session: mockSession,
            contractId: 5,
            name: "  Contrato Aluguel  ",
        });

        assert.equal(result.success, true);
        assert.deepEqual(renamedWith, {
            id: 5,
            contextId: 10,
            name: "Contrato Aluguel",
        });
    });
});
