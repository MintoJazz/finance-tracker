import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BcryptHasher } from "./bcrypt-hasher";

describe("BcryptHasher", () => {
    const hasher = new BcryptHasher();

    it("gera hash diferente da senha e confere a senha correta", async () => {
        const hash = await hasher.hash("segredo1");

        assert.notEqual(hash, "segredo1");
        assert.match(hash, /^\$2[aby]\$10\$/);
        assert.equal(await hasher.compare("segredo1", hash), true);
    });

    it("recusa senha errada", async () => {
        const hash = await hasher.hash("segredo1");
        assert.equal(await hasher.compare("segredo2", hash), false);
        assert.equal(await hasher.compare("", hash), false);
    });

    it("duas chamadas com a mesma senha geram hashes distintos (salt aleatório)", async () => {
        assert.notEqual(await hasher.hash("segredo1"), await hasher.hash("segredo1"));
    });

    it("senhas diferentes dentro dos primeiros 72 bytes não se confundem", async () => {
        const hash = await hasher.hash("a".repeat(71) + "X");
        assert.equal(await hasher.compare("a".repeat(71) + "Y", hash), false);
    });

    // Defeito conhecido: o bcrypt só considera os primeiros 72 bytes.
    it(
        "senhas que diferem apenas após o byte 72 deveriam ser distinguidas",
        { todo: "bcrypt trunca em 72 bytes e o cadastro não limita o tamanho da senha" },
        async () => {
            const prefix = "a".repeat(72);
            const hash = await hasher.hash(prefix + "X");
            assert.equal(await hasher.compare(prefix + "Y", hash), false);
        }
    );
});
