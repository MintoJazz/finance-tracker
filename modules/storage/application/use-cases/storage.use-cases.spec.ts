import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { failure, success } from "@/types/result.types";
import type { Attachment, AttachmentStatus } from "../../models/attachment.schema";
import {
    AttachmentSchema,
    ConfirmUploadSchema,
    RequestUploadSchema,
} from "../../models/attachment.schema";
import type {
    CreatePendingAttachmentDTO,
    IAttachmentRepository,
} from "../interfaces/attachment-repository.interface";
import type { IFileStorage } from "../interfaces/file-storage.interface";
import type { ISpaceAccessProvider } from "../interfaces/space-access-provider.interface";
import { MIME_TO_EXTENSION, UPLOAD_POLICIES } from "../policies/upload-policies";
import { CleanupStaleUploadsUseCase } from "./cleanup-stale-uploads.use-case";
import { ConfirmUploadUseCase } from "./confirm-upload.use-case";
import { RequestUploadUseCase } from "./request-upload.use-case";

const UUID = "3f2b8c1e-5d4a-4e7b-9c1a-2b3c4d5e6f70";
const MB = 1024 * 1024;

const attachment = (overrides: Partial<Attachment> = {}): Attachment => ({
    id: UUID,
    key: `parties/5/avatar/${UUID}.png`,
    purpose: "AVATAR",
    mimeType: "image/png",
    size: 1000,
    status: "PENDING" as AttachmentStatus,
    ownerPartyId: 5,
    createdAt: new Date(),
    ...overrides,
});

describe("UPLOAD_POLICIES", () => {
    it("todo tipo MIME permitido tem extensão mapeada", () => {
        for (const policy of Object.values(UPLOAD_POLICIES)) {
            for (const mime of policy.allowedMimeTypes) {
                assert.ok(MIME_TO_EXTENSION[mime], mime);
            }
        }
    });

    it("avatar: só imagens, até 5 MB, sem exigir contexto", () => {
        const p = UPLOAD_POLICIES.AVATAR;
        assert.deepEqual(p.allowedMimeTypes, ["image/png", "image/jpeg", "image/webp"]);
        assert.equal(p.maxSize, 5 * MB);
        assert.equal(p.requiresContextAccess, false);
        assert.equal(p.keyPrefix({ partyId: 5 }, "x"), "parties/5/avatar");
    });

    it("comprovante: imagens e PDF, até 10 MB, exige contexto", () => {
        const p = UPLOAD_POLICIES.ENTRY_RECEIPT;
        assert.ok(p.allowedMimeTypes.includes("application/pdf"));
        assert.equal(p.maxSize, 10 * MB);
        assert.equal(p.requiresContextAccess, true);
        assert.equal(p.keyPrefix({ partyId: 5, contextId: 100 }, "x"), "contexts/100/receipts");
    });
});

describe("Schemas de anexo", () => {
    it("RequestUploadSchema valida nome, tipo, tamanho e finalidade", () => {
        const base = { name: "a.png", mimeType: "image/png", size: 1, purpose: "AVATAR" };
        assert.equal(RequestUploadSchema.safeParse(base).success, true);
        assert.equal(RequestUploadSchema.safeParse({ ...base, name: "" }).success, false);
        assert.equal(RequestUploadSchema.safeParse({ ...base, mimeType: "" }).success, false);
        assert.equal(RequestUploadSchema.safeParse({ ...base, size: 0 }).success, false);
        assert.equal(RequestUploadSchema.safeParse({ ...base, size: 1.5 }).success, false);
        assert.equal(RequestUploadSchema.safeParse({ ...base, purpose: "OTHER" }).success, false);
    });
    it("ConfirmUploadSchema exige UUID", () => {
        assert.equal(ConfirmUploadSchema.safeParse({ attachmentId: UUID }).success, true);
        assert.equal(ConfirmUploadSchema.safeParse({ attachmentId: "123" }).success, false);
    });
    it("AttachmentSchema converte datas e aceita contexto nulo", () => {
        const parsed = AttachmentSchema.parse({ ...attachment(), createdAt: "2026-01-01", contextId: null });
        assert.ok(parsed.createdAt instanceof Date);
    });
});

describe("RequestUploadUseCase", () => {
    afterEach(() => mock.restoreAll());

    function setup(options: { access?: ISpaceAccessProvider["execute"]; storageThrows?: boolean } = {}) {
        const created: CreatePendingAttachmentDTO[] = [];
        const uploads: unknown[] = [];
        const accessCalls: unknown[] = [];
        const repo = {
            createPending: async (data: CreatePendingAttachmentDTO) => (created.push(data), attachment()),
        } as unknown as IAttachmentRepository;
        const storage = {
            createUploadUrl: async (params: unknown) => {
                if (options.storageThrows) throw new Error("s3 off");
                uploads.push(params);
                return "https://upload.url";
            },
        } as unknown as IFileStorage;
        const access: ISpaceAccessProvider = {
            execute:
                options.access ??
                (async (dto) => (accessCalls.push(dto), success({ canViewBalances: true, canEditEntries: true }))),
        };
        return { useCase: new RequestUploadUseCase(repo, storage, access), created, uploads, accessCalls };
    }

    const avatar = { name: "a.png", mimeType: "image/png", size: 1000, purpose: "AVATAR" as const };
    const receipt = { name: "r.pdf", mimeType: "application/pdf", size: 1000, purpose: "ENTRY_RECEIPT" as const };

    it("avatar: cria o anexo pendente e devolve a URL de upload, sem consultar o contexto", async () => {
        const { useCase, created, uploads, accessCalls } = setup();
        const result = await useCase.execute({ session: { partyId: 5, contextId: 100 }, input: avatar });

        assert.equal(result.success, true);
        assert.equal(result.data?.uploadUrl, "https://upload.url");
        assert.match(result.data!.attachmentId, /^[0-9a-f-]{36}$/);
        assert.deepEqual(accessCalls, []);
        assert.equal(created[0].key, `parties/5/avatar/${result.data!.attachmentId}.png`);
        assert.equal(created[0].contextId, null);
        assert.equal(created[0].ownerPartyId, 5);
        assert.deepEqual(uploads[0], { key: created[0].key, mimeType: "image/png", size: 1000, expiresInSec: 300 });
    });

    it("limite de tamanho: 5 MB aceito, 5 MB + 1 recusado", async () => {
        const { useCase } = setup();
        const at = await useCase.execute({ session: { partyId: 5 }, input: { ...avatar, size: 5 * MB } });
        const over = await useCase.execute({ session: { partyId: 5 }, input: { ...avatar, size: 5 * MB + 1 } });

        assert.equal(at.success, true);
        assert.deepEqual(over, { success: false, error: "Tamanho do arquivo excede o limite permitido" });
    });

    it("recusa tipo MIME fora da política (PDF como avatar)", async () => {
        const result = await setup().useCase.execute({
            session: { partyId: 5 },
            input: { ...avatar, mimeType: "application/pdf" },
        });
        assert.deepEqual(result, { success: false, error: "Tipo de arquivo não permitido" });
    });

    it("recusa entrada inválida com a mensagem do schema", async () => {
        const result = await setup().useCase.execute({ session: { partyId: 5 }, input: { ...avatar, size: 0 } });
        assert.deepEqual(result, { success: false, error: "O tamanho do arquivo deve ser positivo" });
    });

    it("comprovante sem contexto na sessão é recusado", async () => {
        const result = await setup().useCase.execute({ session: { partyId: 5 }, input: receipt });
        assert.deepEqual(result, { success: false, error: "Contexto financeiro não especificado" });
    });

    it("comprovante: propaga negativa de acesso ao contexto", async () => {
        mock.method(console, "warn", () => {});
        const { useCase, created } = setup({ access: async () => failure("Sem permissão para acessar este contexto!") });
        const result = await useCase.execute({ session: { partyId: 5, contextId: 100 }, input: receipt });

        assert.deepEqual(result, { success: false, error: "Sem permissão para acessar este contexto!" });
        assert.deepEqual(created, []);
    });

    it("comprovante: exige a permissão da política e grava o contexto", async () => {
        const denied = setup({ access: async () => success({ canEditEntries: false }) });
        assert.deepEqual(
            await denied.useCase.execute({ session: { partyId: 5, contextId: 100 }, input: receipt }),
            { success: false, error: "Sem permissão para anexar arquivos neste contexto" }
        );

        const allowed = setup();
        const result = await allowed.useCase.execute({ session: { partyId: 5, contextId: 100 }, input: receipt });
        assert.equal(result.success, true);
        assert.equal(allowed.created[0].contextId, 100);
        assert.equal(allowed.created[0].key.endsWith(".pdf"), true);
        assert.deepEqual(allowed.accessCalls, [{ contextId: 100, partyId: 5 }]);
    });

    // Defeito conhecido (ver relatório): a política exige "canEditEntries", permissão que o
    // GetSpaceAccessUseCase nunca devolve (só canViewBalances e canManageBalances). Com as
    // permissões reais, nenhum comprovante consegue ser enviado.
    it(
        "comprovante: quem pode gerenciar saldos (permissões reais do Space) deveria conseguir anexar",
        { todo: "UPLOAD_POLICIES.ENTRY_RECEIPT usa a permissão inexistente canEditEntries" },
        async () => {
            const { useCase } = setup({
                access: async () => success({ canViewBalances: true, canManageBalances: true }),
            });
            const result = await useCase.execute({ session: { partyId: 5, contextId: 100 }, input: receipt });
            assert.equal(result.success, true);
        }
    );

    it("converte falha do storage em erro genérico", async () => {
        mock.method(console, "error", () => {});
        const result = await setup({ storageThrows: true }).useCase.execute({ session: { partyId: 5 }, input: avatar });
        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});

describe("ConfirmUploadUseCase", () => {
    afterEach(() => mock.restoreAll());

    function setup(options: {
        stored?: Attachment | null;
        head?: { size: number; mimeType: string } | null;
        throws?: boolean;
    } = {}) {
        const confirmed: string[] = [];
        const repo = {
            findById: async () => {
                if (options.throws) throw new Error("db offline");
                return "stored" in options ? options.stored : attachment();
            },
            markConfirmed: async (id: string) => (confirmed.push(id), attachment({ status: "CONFIRMED" })),
        } as unknown as IAttachmentRepository;
        const storage = {
            head: async () => ("head" in options ? options.head : { size: 1000, mimeType: "image/png" }),
        } as unknown as IFileStorage;
        return {
            confirmed,
            execute: (attachmentId = UUID, partyId = 5) =>
                new ConfirmUploadUseCase(repo, storage).execute({ session: { partyId }, input: { attachmentId } }),
        };
    }

    it("confirma quando o objeto existe e bate com o registro", async () => {
        const { execute, confirmed } = setup();
        const result = await execute();

        assert.deepEqual(result, {
            success: true,
            data: { attachmentId: UUID, key: `parties/5/avatar/${UUID}.png`, status: "CONFIRMED" },
        });
        assert.deepEqual(confirmed, [UUID]);
    });

    it("é idempotente: anexo já confirmado não é verificado nem gravado de novo", async () => {
        const { execute, confirmed } = setup({ stored: attachment({ status: "CONFIRMED" }), head: null });
        const result = await execute();

        assert.equal(result.success, true);
        assert.equal(result.data?.status, "CONFIRMED");
        assert.deepEqual(confirmed, []);
    });

    it("rejeita id que não é UUID", async () => {
        assert.deepEqual(await setup().execute("123"), { success: false, error: "ID de anexo inválido" });
    });

    it("rejeita anexo inexistente e de outro usuário", async () => {
        assert.deepEqual(await setup({ stored: null }).execute(), { success: false, error: "Anexo não encontrado" });

        mock.method(console, "warn", () => {});
        const { execute, confirmed } = setup();
        assert.deepEqual(await execute(UUID, 99), {
            success: false,
            error: "Sem permissão para confirmar este anexo",
        });
        assert.deepEqual(confirmed, []);
    });

    it("rejeita quando o arquivo não está no storage ou diverge em tamanho/tipo", async () => {
        assert.deepEqual(await setup({ head: null }).execute(), {
            success: false,
            error: "Arquivo não encontrado no storage",
        });
        assert.deepEqual(await setup({ head: { size: 999, mimeType: "image/png" } }).execute(), {
            success: false,
            error: "Tamanho do arquivo diverge do registro",
        });
        assert.deepEqual(await setup({ head: { size: 1000, mimeType: "image/jpeg" } }).execute(), {
            success: false,
            error: "Tipo do arquivo diverge do registro",
        });
    });

    it("converte exceção em erro genérico", async () => {
        mock.method(console, "error", () => {});
        const result = await setup({ throws: true }).execute();
        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});

describe("CleanupStaleUploadsUseCase", () => {
    afterEach(() => mock.restoreAll());

    const stale = (n: number) => Array.from({ length: n }, (_, i) => attachment({ id: `id-${i}`, key: `k-${i}` }));

    function setup(options: { items?: Attachment[]; storageFails?: string[]; dbFails?: string[]; findThrows?: boolean } = {}) {
        const thresholds: Date[] = [];
        const removedKeys: string[] = [];
        const removedIds: string[] = [];
        const repo = {
            findStalePending: async (olderThan: Date) => {
                if (options.findThrows) throw new Error("db offline");
                thresholds.push(olderThan);
                return options.items ?? [];
            },
            delete: async (id: string) => {
                if (options.dbFails?.includes(id)) throw new Error("db fail");
                removedIds.push(id);
            },
        } as unknown as IAttachmentRepository;
        const storage = {
            delete: async (key: string) => {
                if (options.storageFails?.includes(key)) throw new Error("s3 fail");
                removedKeys.push(key);
            },
        } as unknown as IFileStorage;
        return { useCase: new CleanupStaleUploadsUseCase(repo, storage), thresholds, removedKeys, removedIds };
    }

    it("sem pendências devolve contagem zero", async () => {
        const { useCase } = setup();
        assert.deepEqual(await useCase.execute(), {
            success: true,
            data: { cleanedCount: 0, deletedIds: [], failedIds: [] },
        });
    });

    it("usa a data informada como limite e, por padrão, uma hora atrás", async () => {
        const custom = new Date("2026-01-01");
        const a = setup();
        await a.useCase.execute({ olderThan: custom });
        assert.equal(a.thresholds[0], custom);

        const b = setup();
        const before = Date.now() - 60 * 60 * 1000;
        await b.useCase.execute();
        const used = b.thresholds[0].getTime();
        assert.ok(used >= before - 1000 && used <= Date.now() - 60 * 60 * 1000 + 1000);
    });

    it("remove o objeto do storage e depois o registro", async () => {
        const { useCase, removedKeys, removedIds } = setup({ items: stale(3) });
        const result = await useCase.execute();

        assert.equal(result.data?.cleanedCount, 3);
        assert.deepEqual(removedKeys.sort(), ["k-0", "k-1", "k-2"]);
        assert.deepEqual(removedIds.sort(), ["id-0", "id-1", "id-2"]);
    });

    it("falha no storage preserva o registro (para tentar de novo depois)", async () => {
        mock.method(console, "warn", () => {});
        const { useCase, removedIds } = setup({ items: stale(2), storageFails: ["k-0"] });
        const result = await useCase.execute();

        assert.deepEqual(result.data?.failedIds, ["id-0"]);
        assert.deepEqual(result.data?.deletedIds, ["id-1"]);
        assert.deepEqual(removedIds, ["id-1"]);
    });

    it("falha ao excluir o registro é contada como falha", async () => {
        mock.method(console, "error", () => {});
        const { useCase } = setup({ items: stale(2), dbFails: ["id-1"] });
        const result = await useCase.execute();

        assert.deepEqual(result.data?.failedIds, ["id-1"]);
        assert.equal(result.data?.cleanedCount, 1);
    });

    it("processa em lotes de 20 sem perder itens (limite 20 e 21)", async () => {
        for (const n of [20, 21, 45]) {
            const { useCase } = setup({ items: stale(n) });
            const result = await useCase.execute();
            assert.equal(result.data?.cleanedCount, n, `n=${n}`);
        }
    });

    it("converte falha na consulta em erro genérico", async () => {
        mock.method(console, "error", () => {});
        const result = await setup({ findThrows: true }).useCase.execute();
        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});
