import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { cardEntity, session, setupCardUseCase, silenceConsole } from "./card.test-support";
import { UpdateCardUseCase } from "./update-card.use-case";

const data = { id: 7, name: "Nubank Ultra", limit: 500000, closingDay: 5, dueDay: 12 };

describe("UpdateCardUseCase", () => {
    afterEach(() => mock.restoreAll());

    it("atualiza um cartão ativo do contexto", async () => {
        const { repository, access, calls } = setupCardUseCase();
        const result = await new UpdateCardUseCase(repository, access).execute({ session, data });

        assert.equal(result.success, true);
        assert.deepEqual(result.data, { id: 7, name: "Nubank Ultra" });
        assert.deepEqual(calls, ["find:7:100", "update:7:100:Nubank Ultra"]);
    });

    it("propaga a falha do provider de acesso", async () => {
        silenceConsole();
        const { repository, access, calls } = setupCardUseCase({ accessError: "Sem acesso" });
        const result = await new UpdateCardUseCase(repository, access).execute({ session, data });

        assert.deepEqual(result, { success: false, error: "Sem acesso" });
        assert.deepEqual(calls, []);
    });

    it("nega quem não pode gerenciar saldos", async () => {
        silenceConsole();
        const { repository, access, calls } = setupCardUseCase({
            permissions: { canViewBalances: true, canManageBalances: false },
        });
        const result = await new UpdateCardUseCase(repository, access).execute({ session, data });

        assert.equal(result.success, false);
        assert.match(result.error!, /permissão/i);
        assert.deepEqual(calls, []);
    });

    it("falha quando o cartão não existe", async () => {
        const { repository, access } = setupCardUseCase({ card: null });
        const result = await new UpdateCardUseCase(repository, access).execute({ session, data });

        assert.deepEqual(result, { success: false, error: "Cartão não encontrado." });
    });

    it("não permite editar cartão arquivado", async () => {
        const { repository, access, calls } = setupCardUseCase({
            card: cardEntity({ isArchived: true }),
        });
        const result = await new UpdateCardUseCase(repository, access).execute({ session, data });

        assert.deepEqual(result, {
            success: false,
            error: "Não é possível editar um cartão arquivado.",
        });
        assert.ok(!calls.some((c) => c.startsWith("update")));
    });

    it("converte exceção do repositório em erro genérico", async () => {
        silenceConsole();
        const { repository, access } = setupCardUseCase({ repositoryThrows: true });
        const result = await new UpdateCardUseCase(repository, access).execute({ session, data });

        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});
