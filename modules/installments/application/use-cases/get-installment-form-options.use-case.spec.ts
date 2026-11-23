import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ICategoryQueries } from "@/modules/categories/application/interfaces/category-queries.interface";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success } from "@/types/result.types";
import type { IInstallmentQueries } from "../interfaces/installment-queries.interface";
import { GetInstallmentFormOptionsUseCase } from "./get-installment-form-options.use-case";

const session: SessionPayload = { contextId: 100, partyId: 5 };

const categories = [{ id: 1, name: "Casa", icon: null, color: null }];
const subcategories = [
    { id: 11, parentId: 1, parentName: "Casa", name: "Aluguel", icon: null, color: null },
];
const cards = [{ id: 7, name: "Nubank" }];

function build(access: unknown, spy: string[] = []) {
    const categoryQueries = {
        listActiveCategoryOptions: async (contextId: number) => {
            spy.push(`categories-${contextId}`);
            return categories;
        },
        listActiveSubcategoryOptions: async (contextId: number) => {
            spy.push(`subcategories-${contextId}`);
            return subcategories;
        },
    } as unknown as ICategoryQueries;
    const installmentQueries = {
        listCardOptions: async (contextId: number) => {
            spy.push(`cards-${contextId}`);
            return cards;
        },
    } as unknown as IInstallmentQueries;
    const getSpaceAccess: ISpaceAccessProvider = { execute: async () => access as never };
    return new GetInstallmentFormOptionsUseCase(categoryQueries, installmentQueries, getSpaceAccess);
}

describe("GetInstallmentFormOptionsUseCase", () => {
    it("devolve categorias, subcategorias e cartões do contexto da sessão", async () => {
        const spy: string[] = [];
        const result = await build(success({ canViewBalances: true, canManageBalances: false }), spy).execute({ session });

        assert.equal(result.success, true);
        if (result.success) assert.deepEqual(result.data, { categories, subcategories, cards });
        assert.deepEqual(spy.sort(), ["cards-100", "categories-100", "subcategories-100"]);
    });

    it("falha de acesso: devolve o erro", async () => {
        const result = await build(failure("Contexto inválido")).execute({ session });
        assert.equal(result.success, false);
        if (!result.success) assert.equal(result.error, "Contexto inválido");
    });

    it("sem canViewBalances: nega sem consultar", async () => {
        const spy: string[] = [];
        const result = await build(success({ canViewBalances: false, canManageBalances: false }), spy).execute({ session });
        assert.equal(result.success, false);
        if (!result.success) assert.match(result.error, /permissão/i);
        assert.deepEqual(spy, []);
    });

    it("erro inesperado vira mensagem genérica", async () => {
        const useCase = new GetInstallmentFormOptionsUseCase(
            {
                listActiveCategoryOptions: async () => {
                    throw new Error("db down");
                },
                listActiveSubcategoryOptions: async () => [],
            } as unknown as ICategoryQueries,
            { listCardOptions: async () => [] } as unknown as IInstallmentQueries,
            { execute: async () => success({ canViewBalances: true, canManageBalances: false }) } as unknown as ISpaceAccessProvider
        );
        const result = await useCase.execute({ session });
        assert.equal(result.success, false);
        if (!result.success) {
            assert.match(result.error, /erro interno/i);
            assert.doesNotMatch(result.error, /db down/);
        }
    });
});
