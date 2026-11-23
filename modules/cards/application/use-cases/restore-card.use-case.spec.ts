import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { cardEntity, session, setupCardUseCase, silenceConsole } from "./card.test-support";
import { RestoreCardUseCase } from "./restore-card.use-case";

describe("RestoreCardUseCase", () => {
    afterEach(() => mock.restoreAll());

    it("restaura um cartão arquivado", async () => {
        const { repository, access, calls } = setupCardUseCase({
            card: cardEntity({ isArchived: true }),
        });
        const result = await new RestoreCardUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.equal(result.success, true);
        assert.deepEqual(calls, ["find:7:100", "restore:7"]);
    });

    it("propaga a falha do provider de acesso", async () => {
        silenceConsole();
        const { repository, access, calls } = setupCardUseCase({ accessError: "Sem acesso" });
        const result = await new RestoreCardUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.deepEqual(result, { success: false, error: "Sem acesso" });
        assert.deepEqual(calls, []);
    });

    it("nega quem não pode gerenciar saldos", async () => {
        silenceConsole();
        const { repository, access, calls } = setupCardUseCase({
            permissions: { canViewBalances: true, canManageBalances: false },
        });
        const result = await new RestoreCardUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.equal(result.success, false);
        assert.match(result.error!, /permissão/i);
        assert.deepEqual(calls, []);
    });

    it("falha quando o cartão não existe", async () => {
        const { repository, access } = setupCardUseCase({ card: null });
        const result = await new RestoreCardUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.deepEqual(result, { success: false, error: "Cartão não encontrado." });
    });

    it("não restaura um cartão que já está ativo", async () => {
        const { repository, access, calls } = setupCardUseCase();
        const result = await new RestoreCardUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.deepEqual(result, { success: false, error: "Este cartão não está arquivado." });
        assert.ok(!calls.some((c) => c.startsWith("restore")));
    });

    it("converte exceção do repositório em erro genérico", async () => {
        silenceConsole();
        const { repository, access } = setupCardUseCase({ repositoryThrows: true });
        const result = await new RestoreCardUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});
