import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { session, setupCardUseCase, silenceConsole } from "./card.test-support";
import { CreateCardUseCase } from "./create-card.use-case";

const data = { name: "Nubank", limit: 300000, closingDay: 5, dueDay: 12 };

describe("CreateCardUseCase", () => {
    afterEach(() => mock.restoreAll());

    it("cria o cartão no contexto da sessão", async () => {
        const { repository, access, calls } = setupCardUseCase();
        const result = await new CreateCardUseCase(repository, access).execute({ session, data });

        assert.equal(result.success, true);
        assert.deepEqual(result.data, { id: 1, name: "Nubank" });
        assert.deepEqual(calls, ["create:Nubank:300000:5:12"]);
    });

    it("propaga a falha do provider de acesso sem criar", async () => {
        silenceConsole();
        const { repository, access, calls } = setupCardUseCase({ accessError: "Sem acesso" });
        const result = await new CreateCardUseCase(repository, access).execute({ session, data });

        assert.deepEqual(result, { success: false, error: "Sem acesso" });
        assert.deepEqual(calls, []);
    });

    it("nega quem só pode visualizar saldos", async () => {
        silenceConsole();
        const { repository, access, calls } = setupCardUseCase({
            permissions: { canViewBalances: true, canManageBalances: false },
        });
        const result = await new CreateCardUseCase(repository, access).execute({ session, data });

        assert.equal(result.success, false);
        assert.match(result.error!, /permissão|criar/i);
        assert.deepEqual(calls, []);
    });

    it("converte exceção do repositório em erro genérico", async () => {
        silenceConsole();
        const { repository, access } = setupCardUseCase({ repositoryThrows: true });
        const result = await new CreateCardUseCase(repository, access).execute({ session, data });

        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});
