import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { walletEntity, session, setupWalletUseCase, silenceConsole } from "./wallet.test-support";
import { RestoreWalletUseCase } from "./restore-wallet.use-case";

describe("RestoreWalletUseCase", () => {
    afterEach(() => mock.restoreAll());

    it("restaura uma carteira arquivado", async () => {
        const { repository, access, calls } = setupWalletUseCase({
            wallet: walletEntity({ isArchived: true }),
        });
        const result = await new RestoreWalletUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.equal(result.success, true);
        assert.deepEqual(calls, ["find:7:100", "restore:7"]);
    });

    it("propaga a falha do provider de acesso", async () => {
        silenceConsole();
        const { repository, access, calls } = setupWalletUseCase({ accessError: "Sem acesso" });
        const result = await new RestoreWalletUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.deepEqual(result, { success: false, error: "Sem acesso" });
        assert.deepEqual(calls, []);
    });

    it("nega quem não pode gerenciar saldos", async () => {
        silenceConsole();
        const { repository, access, calls } = setupWalletUseCase({
            permissions: { canViewBalances: true, canManageBalances: false },
        });
        const result = await new RestoreWalletUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.equal(result.success, false);
        assert.match(result.error!, /permissão/i);
        assert.deepEqual(calls, []);
    });

    it("falha quando a carteira não existe", async () => {
        const { repository, access } = setupWalletUseCase({ wallet: null });
        const result = await new RestoreWalletUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.deepEqual(result, { success: false, error: "Carteira não encontrada." });
    });

    it("não restaura uma carteira que já está ativo", async () => {
        const { repository, access, calls } = setupWalletUseCase();
        const result = await new RestoreWalletUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.deepEqual(result, { success: false, error: "Esta carteira não está arquivada." });
        assert.ok(!calls.some((c) => c.startsWith("restore")));
    });

    it("converte exceção do repositório em erro genérico", async () => {
        silenceConsole();
        const { repository, access } = setupWalletUseCase({ repositoryThrows: true });
        const result = await new RestoreWalletUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});
