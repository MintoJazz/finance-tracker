import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ICategoryRepository } from "@/modules/categories/application/interfaces/category-repository.interface";
import { CategoryDomainError } from "@/modules/categories/application/policies/category.policy";
import type { CategoryEntity } from "@/modules/categories/models/category.schema";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success } from "@/types/result.types";
import type { InstallmentFormValues } from "../../models/schemas/installment-form.schema";
import type {
    CreateInstallmentRepositoryDTO,
    IInstallmentRepository,
} from "../interfaces/installment-repository.interface";
import type { IInstallmentUnitOfWork } from "../interfaces/installment-uow.interface";
import type { InstallmentCardRecord } from "../policies/installment.policy";
import { CreateInstallmentUseCase } from "./create-installment.use-case";

const session: SessionPayload = { contextId: 100, partyId: 5 };
const canManage = { canViewBalances: true, canManageBalances: true };

const category = (id: number, parentId: number | null, overrides: Partial<CategoryEntity> = {}) =>
    ({ id, parentId, contextId: 100, name: `cat-${id}`, removedAt: null, isArchived: false, ...overrides }) as CategoryEntity;

const draft = (name: string) => ({ name, color: "#06B6D4", icon: "Tag" });

const baseInvoice: InstallmentFormValues = {
    type: "INVOICE",
    name: "Notebook",
    totalAmount: 10000,
    totalInstallments: 3,
    purchaseDate: "2030-11-15",
    cardId: 7,
    categoryId: 1,
    newCategory: null,
    subcategoryId: 11,
    newSubcategory: null,
};

function setup(
    options: {
        access?: ReturnType<typeof success> | ReturnType<typeof failure>;
        categories?: CategoryEntity[];
        cards?: InstallmentCardRecord[];
        failCreate?: boolean;
        failCategoryCreate?: Error;
    } = {}
) {
    const calls: string[] = [];
    const created: CreateInstallmentRepositoryDTO[] = [];
    const createdCategories: { contextId: number; data: { parentId?: number | null } }[] = [];
    let committed = false;
    let nextCategoryId = 500;

    const categoryRepo = {
        findByIdAndContextId: async (id: number) => {
            calls.push(`find-${id}`);
            return (options.categories ?? []).find((c) => c.id === id) ?? null;
        },
        create: async (contextId: number, data: { parentId?: number | null }) => {
            if (options.failCategoryCreate) throw options.failCategoryCreate;
            calls.push(data.parentId == null ? "create-category" : "create-subcategory");
            createdCategories.push({ contextId, data });
            return { id: nextCategoryId++ };
        },
    } as unknown as ICategoryRepository;

    const installmentRepo: IInstallmentRepository = {
        findCardById: async (_contextId, cardId) => {
            calls.push(`card-${cardId}`);
            return (options.cards ?? []).find((c) => c.id === cardId) ?? null;
        },
        create: async (data) => {
            calls.push("create-installment");
            if (options.failCreate) throw new Error("db down");
            created.push(data);
            return { id: 900, name: data.name };
        },
    };

    const unitOfWork: IInstallmentUnitOfWork = {
        run: async (work) => {
            const result = await work({ categoryRepo, installmentRepo });
            committed = true;
            return result;
        },
    };

    const getSpaceAccess: ISpaceAccessProvider = {
        execute: async () => (options.access ?? success(canManage)) as never,
    };

    return {
        useCase: new CreateInstallmentUseCase(unitOfWork, getSpaceAccess),
        calls,
        created,
        createdCategories,
        isCommitted: () => committed,
    };
}

const activeCard = (id = 7): InstallmentCardRecord => ({ id, balanceType: "CREDIT", isArchived: false });
const existingCategories = [category(1, null), category(11, 1)];

describe("CreateInstallmentUseCase", () => {
    it("falha de acesso ao espaço: devolve o erro e não escreve nada", async () => {
        const { useCase, calls } = setup({ access: failure("Contexto inválido") });
        const result = await useCase.execute({ session, data: baseInvoice });
        assert.equal(result.success, false);
        if (!result.success) assert.equal(result.error, "Contexto inválido");
        assert.deepEqual(calls, []);
    });

    it("sem canManageBalances: nega e não escreve nada", async () => {
        const { useCase, calls } = setup({
            access: success({ canViewBalances: true, canManageBalances: false }),
        });
        const result = await useCase.execute({ session, data: baseInvoice });
        assert.equal(result.success, false);
        if (!result.success) assert.match(result.error, /permissão/i);
        assert.deepEqual(calls, []);
    });

    it("fatura com categoria e cartão existentes: valida e cria com o cronograma", async () => {
        const { useCase, calls, created, isCommitted } = setup({
            categories: existingCategories,
            cards: [activeCard()],
        });
        const result = await useCase.execute({ session, data: baseInvoice });

        assert.equal(result.success, true);
        if (result.success) assert.deepEqual(result.data, { id: 900, name: "Notebook" });
        assert.deepEqual(calls, ["card-7", "find-1", "find-11", "create-installment"]);
        assert.equal(isCommitted(), true);

        const dto = created[0];
        assert.equal(dto.contextId, 100);
        assert.equal(dto.type, "INVOICE");
        assert.equal(dto.cardId, 7);
        assert.equal(dto.subcategoryId, 11);
        assert.deepEqual(
            dto.schedule.map((s) => [s.date, s.amount]),
            [
                ["2030-11-15", 3333],
                ["2030-12-15", 3333],
                ["2031-01-15", 3334],
            ]
        );
    });

    it("mês a mês: não consulta o cartão e grava sem cartão", async () => {
        const { useCase, calls, created } = setup({ categories: existingCategories });
        const result = await useCase.execute({
            session,
            data: { ...baseInvoice, type: "MONTHLY", cardId: 7 },
        });

        assert.equal(result.success, true);
        assert.ok(!calls.some((c) => c.startsWith("card-")));
        assert.equal(created[0].cardId, null);
        assert.equal(created[0].type, "MONTHLY");
    });

    it("categoria e subcategoria novas: cria na ordem e usa a subcategoria criada", async () => {
        const { useCase, calls, created, createdCategories } = setup({ cards: [activeCard()] });
        const result = await useCase.execute({
            session,
            data: {
                ...baseInvoice,
                categoryId: null,
                subcategoryId: null,
                newCategory: draft("Eletrônicos"),
                newSubcategory: draft("Notebooks"),
            },
        });

        assert.equal(result.success, true);
        assert.deepEqual(calls, ["card-7", "create-category", "create-subcategory", "create-installment"]);
        assert.equal(createdCategories[0].data.parentId, null);
        assert.equal(createdCategories[1].data.parentId, 500);
        assert.equal(created[0].subcategoryId, 501);
    });

    it("cartão inexistente, de outro tipo ou arquivado: erro de domínio, nada criado e sem commit", async () => {
        const cases: [InstallmentCardRecord[], RegExp][] = [
            [[], /cartão não encontrado/i],
            [[{ id: 7, balanceType: "WALLET", isArchived: false }], /não é um cartão de crédito/i],
            [[{ id: 7, balanceType: "CREDIT", isArchived: true }], /arquivado/i],
        ];
        for (const [cards, pattern] of cases) {
            const { useCase, created, createdCategories, isCommitted } = setup({
                categories: existingCategories,
                cards,
            });
            const result = await useCase.execute({ session, data: baseInvoice });
            assert.equal(result.success, false);
            if (!result.success) assert.match(result.error, pattern);
            assert.equal(created.length, 0);
            assert.equal(createdCategories.length, 0);
            assert.equal(isCommitted(), false);
        }
    });

    it("fatura sem cartão informado: pede o cartão", async () => {
        const { useCase, created } = setup({ categories: existingCategories });
        const result = await useCase.execute({
            session,
            data: { ...baseInvoice, cardId: null },
        });
        assert.equal(result.success, false);
        if (!result.success) assert.match(result.error, /selecione o cartão/i);
        assert.equal(created.length, 0);
    });

    it("subcategoria de outra categoria: erro de categoria e nada criado", async () => {
        const { useCase, created } = setup({
            categories: [category(1, null), category(11, 2)],
            cards: [activeCard()],
        });
        const result = await useCase.execute({ session, data: baseInvoice });
        assert.equal(result.success, false);
        if (!result.success) assert.match(result.error, /não pertence/i);
        assert.equal(created.length, 0);
    });

    it("CategoryDomainError do repositório vira mensagem para o usuário", async () => {
        const { useCase } = setup({
            cards: [activeCard()],
            failCategoryCreate: new CategoryDomainError("Nome inválido", "EMPTY_NAME"),
        });
        const result = await useCase.execute({
            session,
            data: {
                ...baseInvoice,
                categoryId: null,
                subcategoryId: null,
                newCategory: draft(""),
                newSubcategory: draft("x"),
            },
        });
        assert.equal(result.success, false);
        if (!result.success) assert.equal(result.error, "Nome inválido");
    });

    it("erro de banco: mensagem genérica, sem vazar o texto original e sem commit", async () => {
        const { useCase, isCommitted } = setup({
            categories: existingCategories,
            cards: [activeCard()],
            failCreate: true,
        });
        const result = await useCase.execute({ session, data: baseInvoice });
        assert.equal(result.success, false);
        if (!result.success) {
            assert.match(result.error, /erro interno/i);
            assert.doesNotMatch(result.error, /db down/);
        }
        assert.equal(isCommitted(), false);
    });
});
