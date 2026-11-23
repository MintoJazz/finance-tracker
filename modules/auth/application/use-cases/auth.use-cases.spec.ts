import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import type { IFileStorage } from "@/modules/storage/application/interfaces/file-storage.interface";
import type { IAttachmentRepository } from "@/modules/storage/application/interfaces/attachment-repository.interface";
import type { Attachment } from "@/modules/storage/models/attachment.schema";
import type { IFinancialContextRepository } from "@/modules/space/application/interfaces/financial-context-repository.interface";
import { Prisma } from "@/prisma/generated/prisma/client";
import type { Auth } from "../../models/auth.schema";
import type { Party } from "../../models/party.schema";
import type { Profile } from "../../models/profile.schema";
import type { IAuthRepository } from "../interfaces/auth-repository.interface";
import type { IPartyRepository } from "../interfaces/party-repository.interface";
import type { IPasswordHasher } from "../interfaces/password-hasher.interface";
import type { ISignupUnitOfWork } from "../interfaces/signup-uow.interface";
import { GetProfileUseCase } from "./get-profile.use-case";
import { LoginUseCase } from "./login.use-case";
import { SignupUseCase } from "./singup.use-case";
import { UpdateAvatarUseCase } from "./update-avatar.use-case";

const now = new Date("2026-01-01");

const auth = (overrides: Partial<Auth> = {}): Auth => ({
    partyId: 5,
    email: "ana@exemplo.com",
    password: "hash:segredo1",
    emailVerifiedAt: null,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
});

const party = (overrides: Partial<Party> = {}): Party => ({
    id: 5,
    name: "Ana Silva",
    documentNumber: "12345678901",
    phone: null,
    avatarUrl: null,
    birthDate: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
});

const hasher: IPasswordHasher = {
    hash: async (p) => `hash:${p}`,
    compare: async (p, h) => h === `hash:${p}`,
};

describe("LoginUseCase", () => {
    afterEach(() => mock.restoreAll());

    function setup(options: { found?: Auth | null; defaultContext?: { contextId: number } | null; throws?: boolean } = {}) {
        const updates: [number, Date][] = [];
        const authRepo = {
            findByEmail: async () => {
                if (options.throws) throw new Error("db offline");
                return "found" in options ? options.found : auth();
            },
            updateLastLoginAt: async (partyId: number, date: Date) => void updates.push([partyId, date]),
        } as unknown as IAuthRepository;
        const contextRepo = {
            findDefaultByParty: async () => ("defaultContext" in options ? options.defaultContext : { contextId: 77 }),
        } as unknown as IFinancialContextRepository;
        return { useCase: new LoginUseCase(authRepo, hasher, contextRepo), updates };
    }

    it("autentica com credenciais corretas, registra o login e devolve o contexto padrão", async () => {
        const { useCase, updates } = setup();
        const result = await useCase.execute({ email: "ana@exemplo.com", password: "segredo1" });

        assert.deepEqual(result, { success: true, data: { partyId: 5, email: "ana@exemplo.com", contextId: 77 } });
        assert.equal(updates.length, 1);
        assert.equal(updates[0][0], 5);
    });

    it("sem contexto padrão usa o partyId como contexto", async () => {
        const { useCase } = setup({ defaultContext: null });
        const result = await useCase.execute({ email: "ana@exemplo.com", password: "segredo1" });
        assert.equal(result.data?.contextId, 5);
    });

    it("usa a mesma mensagem para e-mail inexistente e senha errada (não revela qual falhou)", async () => {
        const unknown = await setup({ found: null }).useCase.execute({ email: "x@y.com", password: "a" });
        const wrong = await setup().useCase.execute({ email: "ana@exemplo.com", password: "errada" });

        assert.deepEqual(unknown, { success: false, error: "E-mail ou senha inválidos." });
        assert.deepEqual(wrong, unknown);
    });

    it("não registra último login quando a senha está errada", async () => {
        const { useCase, updates } = setup();
        await useCase.execute({ email: "ana@exemplo.com", password: "errada" });
        assert.deepEqual(updates, []);
    });

    it("rejeita e-mail em formato inválido antes de consultar o banco", async () => {
        const result = await setup({ throws: true }).useCase.execute({ email: "nao-e-email", password: "x" });
        assert.equal(result.success, false);
        assert.doesNotMatch(result.error!, /erro interno/i);
    });

    it("converte exceção em erro genérico", async () => {
        mock.method(console, "error", () => {});
        const result = await setup({ throws: true }).useCase.execute({ email: "ana@exemplo.com", password: "x" });
        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});

describe("SignupUseCase", () => {
    afterEach(() => mock.restoreAll());

    const form = {
        email: "  Ana@Exemplo.com ",
        password: "segredo1",
        confirmPassword: "segredo1",
        name: "Ana Silva",
        documentNumber: "123.456.789-01",
    };

    function setup(options: { emailTaken?: boolean; cpfTaken?: boolean; uowError?: unknown } = {}) {
        const created: Record<string, unknown> = {};
        const authRepository = {
            findByEmail: async () => (options.emailTaken ? auth() : null),
        } as unknown as IAuthRepository;
        const partyRepository = {
            findByDocumentNumber: async () => (options.cpfTaken ? party() : null),
        } as unknown as IPartyRepository;
        const uow: ISignupUnitOfWork = {
            run: async (work) => {
                if (options.uowError) throw options.uowError;
                return work({
                    partyRepo: {
                        create: async (data: { name: string }) => ((created.party = data), party({ id: 9, name: data.name })),
                    } as unknown as IPartyRepository,
                    authRepo: {
                        create: async (data: { email: string }) => ((created.auth = data), auth({ partyId: 9, email: data.email })),
                    } as unknown as IAuthRepository,
                    contextRepo: {
                        createContextWithOwner: async (data: { name: string }) => ((created.context = data), { id: 33, name: data.name }),
                    } as unknown as IFinancialContextRepository,
                });
            },
        };
        return { useCase: new SignupUseCase(authRepository, partyRepository, hasher, uow), created };
    }

    const duplicate = (target: string[]) =>
        new Prisma.PrismaClientKnownRequestError("duplicado", {
            code: "P2002",
            clientVersion: "test",
            meta: { target },
        });

    it("cadastra: normaliza e-mail e CPF, cria a pessoa, a credencial e o espaço do dono", async () => {
        const { useCase, created } = setup();
        const result = await useCase.execute(form);

        assert.deepEqual(result, {
            success: true,
            data: { partyId: 9, contextId: 33, name: "Ana Silva", email: "ana@exemplo.com" },
        });
        assert.equal((created.party as { documentNumber: string }).documentNumber, "12345678901");
        assert.deepEqual(created.auth, { partyId: 9, email: "ana@exemplo.com", passwordHash: "hash:segredo1" });
        assert.deepEqual(created.context, { name: "Espaço de Ana Silva", ownerPartyId: 9 });
    });

    it("rejeita e-mail e CPF já cadastrados", async () => {
        assert.deepEqual(await setup({ emailTaken: true }).useCase.execute(form), { success: false, error: "E-mail já cadastrado" });
        assert.deepEqual(await setup({ cpfTaken: true }).useCase.execute(form), { success: false, error: "CPF já cadastrado" });
    });

    it("valida o formulário (partições inválidas)", async () => {
        const { useCase } = setup();
        const fail = async (overrides: object) => (await useCase.execute({ ...form, ...overrides })).error;

        assert.equal(await fail({ email: "invalido" }), "Informe um e-mail válido");
        assert.equal(await fail({ password: "12345", confirmPassword: "12345" }), "A senha deve ter pelo menos 6 caracteres");
        assert.equal(await fail({ confirmPassword: "outra" }), "As senhas não coincidem");
        assert.equal(await fail({ name: "A" }), "Nome deve ter pelo menos 2 caracteres");
        assert.equal(await fail({ documentNumber: "123" }), "CPF deve conter 11 dígitos");
    });

    it("traduz violação de unicidade (corrida) pelo campo duplicado", async () => {
        const email = await setup({ uowError: duplicate(["email"]) }).useCase.execute(form);
        const cpf = await setup({ uowError: duplicate(["documentNumber"]) }).useCase.execute(form);
        const other = await setup({ uowError: duplicate(["outro"]) }).useCase.execute(form);

        assert.equal(email.error, "E-mail já cadastrado");
        assert.equal(cpf.error, "CPF já cadastrado");
        assert.equal(other.error, "Registro duplicado encontrado");
    });

    it("erro inesperado vira mensagem genérica", async () => {
        mock.method(console, "error", () => {});
        const result = await setup({ uowError: new Error("boom") }).useCase.execute(form);
        assert.deepEqual(result, { success: false, error: "Erro ao cadastrar usuário" });
    });
});

describe("GetProfileUseCase", () => {
    afterEach(() => mock.restoreAll());

    const profile = (avatarUrl: string | null): Profile => ({ id: 5, name: "Ana", email: "ana@exemplo.com", avatarUrl });

    const run = (options: { profile?: Profile | null; storage?: IFileStorage | undefined; throws?: boolean }, partyId = 5) => {
        const repo = {
            findProfileById: async () => {
                if (options.throws) throw new Error("db offline");
                return options.profile ?? null;
            },
        } as unknown as IPartyRepository;
        return new GetProfileUseCase(repo, options.storage).execute({ partyId });
    };

    const storage = (fn: (key: string, exp?: number) => Promise<string>) => ({ createDownloadUrl: fn }) as unknown as IFileStorage;

    it("rejeita identificador inválido", async () => {
        for (const id of [0, -1]) {
            assert.deepEqual(await run({}, id), { success: false, error: "Identificador de usuário inválido." });
        }
    });

    it("falha quando o perfil não existe", async () => {
        assert.deepEqual(await run({ profile: null }), { success: false, error: "Perfil de usuário não encontrado." });
    });

    it("assina a URL do avatar quando ele é uma chave do storage", async () => {
        const seen: unknown[][] = [];
        const result = await run({
            profile: profile("avatars/5.png"),
            storage: storage(async (...a) => (seen.push(a), "https://cdn/signed")),
        });

        assert.equal(result.data?.avatarUrl, "https://cdn/signed");
        assert.deepEqual(seen, [["avatars/5.png", 86400]]);
    });

    it("mantém avatares que já são URL completa ou caminho absoluto", async () => {
        const never = storage(async () => assert.fail("não deveria assinar"));
        for (const url of ["http://x/a.png", "https://x/a.png", "/img/a.png"]) {
            assert.equal((await run({ profile: profile(url), storage: never })).data?.avatarUrl, url);
        }
    });

    it("sem storage ou sem avatar devolve o perfil como está", async () => {
        assert.equal((await run({ profile: profile("avatars/5.png") })).data?.avatarUrl, "avatars/5.png");
        assert.equal((await run({ profile: profile(null), storage: storage(async () => "x") })).data?.avatarUrl, null);
    });

    it("se a assinatura falhar, o avatar vira nulo mas o perfil é devolvido", async () => {
        mock.method(console, "error", () => {});
        const result = await run({
            profile: profile("avatars/5.png"),
            storage: storage(async () => {
                throw new Error("s3 off");
            }),
        });
        assert.equal(result.success, true);
        assert.equal(result.data?.avatarUrl, null);
    });

    it("converte exceção do banco em erro genérico", async () => {
        mock.method(console, "error", () => {});
        const result = await run({ throws: true });
        assert.equal(result.success, false);
        assert.match(result.error!, /carregar o perfil/i);
    });
});

describe("UpdateAvatarUseCase", () => {
    afterEach(() => mock.restoreAll());

    const attachment = (overrides: Partial<Attachment> = {}): Attachment =>
        ({ id: "att-1", key: "avatars/5.png", ownerPartyId: 5, status: "CONFIRMED", ...overrides }) as Attachment;

    function run(options: { attachment?: Attachment | null; storage?: IFileStorage; throws?: boolean }) {
        const updated: [number, string][] = [];
        const partyRepo = {
            updateAvatar: async (id: number, key: string) => {
                if (options.throws) throw new Error("db offline");
                updated.push([id, key]);
            },
        } as unknown as IPartyRepository;
        const attachmentRepo = {
            findById: async () => ("attachment" in options ? options.attachment : attachment()),
        } as unknown as IAttachmentRepository;
        const useCase = new UpdateAvatarUseCase(partyRepo, attachmentRepo, options.storage);
        return { updated, execute: () => useCase.execute({ partyId: 5, attachmentId: "att-1" }) };
    }

    it("grava a chave do anexo e devolve a URL assinada", async () => {
        const { updated, execute } = run({
            storage: { createDownloadUrl: async (k: string) => `https://cdn/${k}` } as unknown as IFileStorage,
        });
        const result = await execute();

        assert.deepEqual(result, { success: true, data: { avatarUrl: "https://cdn/avatars/5.png" } });
        assert.deepEqual(updated, [[5, "avatars/5.png"]]);
    });

    it("sem storage devolve a própria chave", async () => {
        assert.equal((await run({}).execute()).data?.avatarUrl, "avatars/5.png");
    });

    it("se a assinatura falhar, usa a chave como fallback", async () => {
        const storage = {
            createDownloadUrl: async () => {
                throw new Error("s3 off");
            },
        } as unknown as IFileStorage;
        const result = await run({ storage }).execute();
        assert.equal(result.data?.avatarUrl, "avatars/5.png");
    });

    it("rejeita anexo inexistente, de outro usuário ou não confirmado — sem gravar", async () => {
        const missing = run({ attachment: null });
        assert.deepEqual(await missing.execute(), { success: false, error: "Anexo não encontrado" });

        const foreign = run({ attachment: attachment({ ownerPartyId: 99 }) });
        assert.deepEqual(await foreign.execute(), { success: false, error: "Sem permissão para utilizar este anexo" });

        const pending = run({ attachment: attachment({ status: "PENDING" }) });
        assert.deepEqual(await pending.execute(), { success: false, error: "O upload da foto ainda não foi confirmado" });

        for (const r of [missing, foreign, pending]) assert.deepEqual(r.updated, []);
    });

    it("converte exceção em erro genérico", async () => {
        mock.method(console, "error", () => {});
        assert.deepEqual(await run({ throws: true }).execute(), { success: false, error: "Erro ao salvar foto de perfil" });
    });
});
