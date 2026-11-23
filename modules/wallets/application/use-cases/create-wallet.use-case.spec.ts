import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { session, setupWalletUseCase, silenceConsole } from "./wallet.test-support";
import { CreateWalletUseCase } from "./create-wallet.use-case";

const data = { name: "Nubank" };

describe("CreateWalletUseCase", () => {
    afterEach(() => mock.restoreAll());

    it("cria a carteira no contexto da sessão", async () => {
        const { repository, access, calls } = setupWalletUseCase();
        const result = await new CreateWalletUseCase(repository, access).execute({ session, data });

        assert.equal(result.success, true);
        assert.deepEqual(result.data, { id: 1, name: "Nubank" });
        assert.deepEqual(calls, ["create:Nubank"]);
    });

    it("propaga a falha do provider de acesso sem criar", async () => {
        silenceConsole();
        const { repository, access, calls } = setupWalletUseCase({ accessError: "Sem acesso" });
        const result = await new CreateWalletUseCase(repository, access).execute({ session, data });

        assert.deepEqual(result, { success: false, error: "Sem acesso" });
        assert.deepEqual(calls, []);
    });

    it("nega quem só pode visualizar saldos", async () => {
        silenceConsole();
        const { repository, access, calls } = setupWalletUseCase({
            permissions: { canViewBalances: true, canManageBalances: false },
        });
        const result = await new CreateWalletUseCase(repository, access).execute({ session, data });

        assert.equal(result.success, false);
        assert.match(result.error!, /permissão|criar/i);
        assert.deepEqual(calls, []);
    });

    it("converte exceção do repositório em erro genérico", async () => {
        silenceConsole();
        const { repository, access } = setupWalletUseCase({ repositoryThrows: true });
        const result = await new CreateWalletUseCase(repository, access).execute({ session, data });

        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});
