import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { walletEntity, session, setupWalletUseCase, silenceConsole } from "./wallet.test-support";
import { UpdateWalletUseCase } from "./update-wallet.use-case";

const data = { id: 7, name: "Nubank Ultra" };

describe("UpdateWalletUseCase", () => {
    afterEach(() => mock.restoreAll());

    it("atualiza uma carteira ativo do contexto", async () => {
        const { repository, access, calls } = setupWalletUseCase();
        const result = await new UpdateWalletUseCase(repository, access).execute({ session, data });

        assert.equal(result.success, true);
        assert.deepEqual(result.data, { id: 7, name: "Nubank Ultra" });
        assert.deepEqual(calls, ["find:7:100", "update:7:100:Nubank Ultra"]);
    });

    it("propaga a falha do provider de acesso", async () => {
        silenceConsole();
        const { repository, access, calls } = setupWalletUseCase({ accessError: "Sem acesso" });
        const result = await new UpdateWalletUseCase(repository, access).execute({ session, data });

        assert.deepEqual(result, { success: false, error: "Sem acesso" });
        assert.deepEqual(calls, []);
    });

    it("nega quem não pode gerenciar saldos", async () => {
        silenceConsole();
        const { repository, access, calls } = setupWalletUseCase({
            permissions: { canViewBalances: true, canManageBalances: false },
        });
        const result = await new UpdateWalletUseCase(repository, access).execute({ session, data });

        assert.equal(result.success, false);
        assert.match(result.error!, /permissão/i);
        assert.deepEqual(calls, []);
    });

    it("falha quando a carteira não existe", async () => {
        const { repository, access } = setupWalletUseCase({ wallet: null });
        const result = await new UpdateWalletUseCase(repository, access).execute({ session, data });

        assert.deepEqual(result, { success: false, error: "Carteira não encontrada." });
    });

    it("não permite editar carteira arquivado", async () => {
        const { repository, access, calls } = setupWalletUseCase({
            wallet: walletEntity({ isArchived: true }),
        });
        const result = await new UpdateWalletUseCase(repository, access).execute({ session, data });

        assert.deepEqual(result, {
            success: false,
            error: "Não é possível editar uma carteira arquivada.",
        });
        assert.ok(!calls.some((c) => c.startsWith("update")));
    });

    it("converte exceção do repositório em erro genérico", async () => {
        silenceConsole();
        const { repository, access } = setupWalletUseCase({ repositoryThrows: true });
        const result = await new UpdateWalletUseCase(repository, access).execute({ session, data });

        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});
