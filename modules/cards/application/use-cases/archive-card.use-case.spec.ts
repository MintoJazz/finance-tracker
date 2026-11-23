import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { cardEntity, session, setupCardUseCase, silenceConsole } from "./card.test-support";
import { ArchiveCardUseCase } from "./archive-card.use-case";

describe("ArchiveCardUseCase", () => {
    afterEach(() => mock.restoreAll());

    it("arquiva um cartão ativo do contexto", async () => {
        const { repository, access, calls } = setupCardUseCase();
        const result = await new ArchiveCardUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.equal(result.success, true);
        assert.deepEqual(calls, ["find:7:100", "archive:7"]);
    });

    it("propaga a falha do provider de acesso sem tocar no repositório", async () => {
        silenceConsole();
        const { repository, access, calls } = setupCardUseCase({ accessError: "Sem acesso" });
        const result = await new ArchiveCardUseCase(repository, access).execute({
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
        const result = await new ArchiveCardUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.equal(result.success, false);
        assert.match(result.error!, /permissão/i);
        assert.deepEqual(calls, []);
    });

    it("falha quando o cartão não existe no contexto", async () => {
        const { repository, access, calls } = setupCardUseCase({ card: null });
        const result = await new ArchiveCardUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.deepEqual(result, { success: false, error: "Cartão não encontrado." });
        assert.ok(!calls.some((c) => c.startsWith("archive")));
    });

    it("não arquiva duas vezes o mesmo cartão", async () => {
        const { repository, access, calls } = setupCardUseCase({
            card: cardEntity({ isArchived: true }),
        });
        const result = await new ArchiveCardUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.deepEqual(result, { success: false, error: "Este cartão já está arquivado." });
        assert.ok(!calls.some((c) => c.startsWith("archive")));
    });

    it("converte exceção do repositório em erro genérico", async () => {
        silenceConsole();
        const { repository, access } = setupCardUseCase({ repositoryThrows: true });
        const result = await new ArchiveCardUseCase(repository, access).execute({
            session,
            data: { id: 7 },
        });

        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});
