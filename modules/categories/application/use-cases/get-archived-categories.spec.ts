import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GetArchivedCategoriesUseCase } from "./get-archived-categories.use-case";
import { CategoryMapper } from "../../infra/mappers/category.mapper";
import type { ICategoryQueries } from "../interfaces/category-queries.interface";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ArchivedCategoryGroup } from "../../models/category.schema";

describe("GetArchivedCategoriesUseCase & CategoryMapper", () => {
  const mockSession: SessionPayload = {
    userId: 1,
    contextId: 10,
    partyId: 1,
  } as unknown as SessionPayload;

  describe("CategoryMapper.toArchivedGroups", () => {
    it("deve agrupar corretamente categorias arquivadas e pais ativos de contexto", () => {
      const archivedBalances = [
        { id: 1, name: "Moradia", parentId: null, removedAt: new Date() },
        { id: 101, name: "Aluguel", parentId: 1, removedAt: new Date() },
        { id: 102, name: "Condomínio", parentId: 1, removedAt: new Date() },
        { id: 103, name: "IPTU", parentId: 1, removedAt: new Date() },
        { id: 201, name: "Delivery", parentId: 2, removedAt: new Date() },
        { id: 3, name: "Lazer", parentId: null, removedAt: new Date() },
        { id: 301, name: "Streaming", parentId: 3, removedAt: new Date() },
        { id: 302, name: "Viagens", parentId: 3, removedAt: new Date() },
      ];

      const activeParents = [
        { id: 2, name: "Alimentação", parentId: null, removedAt: null },
      ];

      const result = CategoryMapper.toArchivedGroups(archivedBalances, activeParents);

      // Grupos devem estar ordenados alfabeticamente: Alimentação (ativo), Lazer (arquivado), Moradia (arquivado)
      assert.equal(result.length, 3);

      assert.equal(result[0].name, "Alimentação");
      assert.equal(result[0].archived, false);
      assert.deepEqual(result[0].children, [{ id: 201, name: "Delivery" }]);

      assert.equal(result[1].name, "Lazer");
      assert.equal(result[1].archived, true);
      assert.equal(result[1].children.length, 2);
      assert.equal(result[1].children[0].name, "Streaming");
      assert.equal(result[1].children[1].name, "Viagens");

      assert.equal(result[2].name, "Moradia");
      assert.equal(result[2].archived, true);
      assert.equal(result[2].children.length, 3);
      assert.equal(result[2].children[0].name, "Aluguel");
      assert.equal(result[2].children[1].name, "Condomínio");
      assert.equal(result[2].children[2].name, "IPTU");
    });

    it("deve omitir pais ativos que não possuem subcategorias arquivadas", () => {
      const archivedBalances = [
        { id: 1, name: "Moradia", parentId: null, removedAt: new Date() },
      ];
      const activeParents = [
        { id: 5, name: "Transporte", parentId: null, removedAt: null },
      ];

      const result = CategoryMapper.toArchivedGroups(archivedBalances, activeParents);

      assert.equal(result.length, 1);
      assert.equal(result[0].name, "Moradia");
      assert.equal(result[0].archived, true);
      assert.deepEqual(result[0].children, []);
    });

    it("deve retornar array vazio se não houver registros arquivados", () => {
      const result = CategoryMapper.toArchivedGroups([], []);
      assert.deepEqual(result, []);
    });
  });

  describe("GetArchivedCategoriesUseCase", () => {
    it("deve retornar erro se o acesso ao espaço falhar", async () => {
      const mockAccessProvider: ISpaceAccessProvider = {
        execute: async () => ({ success: false, error: "Acesso negado" }),
      };
      const mockQueries: ICategoryQueries = {
        listArchivedCategories: async () => [],
      } as unknown as ICategoryQueries;

      const useCase = new GetArchivedCategoriesUseCase(mockQueries, mockAccessProvider);
      const res = await useCase.execute({ session: mockSession });

      assert.equal(res.success, false);
      assert.equal(res.error, "Acesso negado");
    });

    it("deve retornar erro se o usuário não tiver permissão canViewBalances", async () => {
      const mockAccessProvider: ISpaceAccessProvider = {
        execute: async () => ({
          success: true,
          data: { canViewBalances: false, canManageBalances: false },
        }),
      };
      const mockQueries: ICategoryQueries = {
        listArchivedCategories: async () => [],
      } as unknown as ICategoryQueries;

      const useCase = new GetArchivedCategoriesUseCase(mockQueries, mockAccessProvider);
      const res = await useCase.execute({ session: mockSession });

      assert.equal(res.success, false);
      assert.equal(res.error, "Sem permissão para visualizar as categorias deste contexto!");
    });

    it("deve retornar as categorias arquivadas quando autorizado", async () => {
      const expectedData: ArchivedCategoryGroup[] = [
        { id: 1, name: "Moradia", archived: true, children: [] },
      ];

      let queriedContextId: number | null = null;
      const mockQueries: ICategoryQueries = {
        listArchivedCategories: async (contextId: number) => {
          queriedContextId = contextId;
          return expectedData;
        },
      } as unknown as ICategoryQueries;

      const mockAccessProvider: ISpaceAccessProvider = {
        execute: async () => ({
          success: true,
          data: { canViewBalances: true, canManageBalances: true },
        }),
      };

      const useCase = new GetArchivedCategoriesUseCase(mockQueries, mockAccessProvider);
      const res = await useCase.execute({ session: mockSession });

      assert.equal(res.success, true);
      assert.equal(queriedContextId, 10);
      assert.deepEqual(res.data, expectedData);
    });
  });
});

