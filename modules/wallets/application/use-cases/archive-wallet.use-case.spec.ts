import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { walletEntity, session, setupWalletUseCase, silenceConsole } from "./wallet.test-support";
import { ArchiveWalletUseCase } from "./archive-wallet.use-case";

describe("ArchiveWalletUseCase", () => {
    afterEach(() => mock.restoreAll());

    it("arquiva uma carteira ativo do contexto", async () => {
        const { repository, access, calls } = setupWalletUseCase();
        const result = await new ArchiveWalletUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.equal(result.success, true);
        assert.deepEqual(calls, ["find:7:100", "archive:7"]);
    });

    it("propaga a falha do provider de acesso sem tocar no repositório", async () => {
        silenceConsole();
        const { repository, access, calls } = setupWalletUseCase({ accessError: "Sem acesso" });
        const result = await new ArchiveWalletUseCase(repository, access).execute({
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
        const result = await new ArchiveWalletUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.equal(result.success, false);
        assert.match(result.error!, /permissão/i);
        assert.deepEqual(calls, []);
    });

    it("falha quando a carteira não existe no contexto", async () => {
        const { repository, access, calls } = setupWalletUseCase({ wallet: null });
        const result = await new ArchiveWalletUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.deepEqual(result, { success: false, error: "Carteira não encontrada." });
        assert.ok(!calls.some((c) => c.startsWith("archive")));
    });

    it("não arquiva duas vezes o mesma carteira", async () => {
        const { repository, access, calls } = setupWalletUseCase({
            wallet: walletEntity({ isArchived: true }),
        });
        const result = await new ArchiveWalletUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.deepEqual(result, { success: false, error: "Esta carteira já está arquivada." });
        assert.ok(!calls.some((c) => c.startsWith("archive")));
    });

    it("converte exceção do repositório em erro genérico", async () => {
        silenceConsole();
        const { repository, access } = setupWalletUseCase({ repositoryThrows: true });
        const result = await new ArchiveWalletUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});
