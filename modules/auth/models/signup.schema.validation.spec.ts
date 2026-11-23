import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SignupSchema } from "./signup.schema";

const valid = {
    email: "ana@exemplo.com",
    password: "segredo1",
    confirmPassword: "segredo1",
    name: "Ana Silva",
    // CPF com dígitos verificadores corretos (gerado para teste)
    documentNumber: "529.982.247-25",
};
const parse = (overrides: Record<string, unknown>) => SignupSchema.safeParse({ ...valid, ...overrides });

describe("SignupSchema — comportamento atual (linha de base)", () => {
    it("aceita um cadastro válido e normaliza e-mail e CPF", () => {
        const result = parse({ email: "  ANA@Exemplo.com " });
        assert.equal(result.success, true);
        assert.equal(result.data?.email, "ana@exemplo.com");
        assert.equal(result.data?.documentNumber, "52998224725");
    });

    it("CPF: 10 dígitos recusado, 11 aceito, 12 recusado (valor limite)", () => {
        assert.equal(parse({ documentNumber: "1234567890" }).success, false);
        assert.equal(parse({ documentNumber: "52998224725" }).success, true);
        assert.equal(parse({ documentNumber: "529982247250" }).success, false);
    });

    it("senha: 5 caracteres recusada, 6 aceita (valor limite)", () => {
        assert.equal(parse({ password: "12345", confirmPassword: "12345" }).success, false);
        assert.equal(parse({ password: "123456", confirmPassword: "123456" }).success, true);
    });

    it("exige confirmação de senha igual", () => {
        assert.equal(parse({ confirmPassword: "outra" }).success, false);
    });
});

// Defeitos conhecidos: os testes abaixo descrevem o comportamento correto e hoje falham.
describe("SignupSchema — defeitos conhecidos", () => {
    it(
        "CPF com todos os dígitos iguais (111.111.111-11) deveria ser recusado",
        { todo: "só a quantidade de dígitos do CPF é validada; dígitos verificadores são ignorados" },
        () => {
            assert.equal(parse({ documentNumber: "111.111.111-11" }).success, false);
        }
    );

    it(
        "CPF com dígitos verificadores errados (123.456.789-00) deveria ser recusado",
        { todo: "o CPF aceita qualquer sequência de 11 dígitos" },
        () => {
            assert.equal(parse({ documentNumber: "123.456.789-00" }).success, false);
        }
    );

    it(
        "data de nascimento no futuro deveria ser recusada",
        { todo: "birthDate aceita qualquer data, inclusive 2999-01-01" },
        () => {
            assert.equal(parse({ birthDate: "2999-01-01" }).success, false);
        }
    );

    it(
        "senha acima de 72 bytes deveria ser recusada (limite efetivo do bcrypt)",
        { todo: "sem teto de tamanho: o bcrypt ignora tudo após 72 bytes (ver bcrypt-hasher.spec.ts)" },
        () => {
            const long = "a".repeat(73);
            assert.equal(parse({ password: long, confirmPassword: long }).success, false);
        }
    );
});
