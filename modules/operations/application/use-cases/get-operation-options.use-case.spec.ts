import assert from "node:assert/strict"
import { describe, it } from "node:test"
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils"
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface"
import { success, failure } from "@/types/result.types"
import { GetOperationOptionsUseCase } from "./get-operation-options.use-case"
import { GetCustodyOptionsUseCase } from "./get-custody-options.use-case"
import type {
  ICategoryOptionsProvider,
  ICustodyOptionsProvider,
  ISubcategoryOptionsProvider,
} from "../interfaces/operation-options-provider.interface"
import {
  OperationOptionsSchema,
  CategoryOptionSchema,
  SubcategoryOptionSchema,
  CustodyOptionSchema,
} from "../../models/operation-options.schema"
import { CategoryOptionsPrismaProvider } from "../../infra/providers/category-options-prisma.provider"
import { CustodyOptionsPrismaProvider } from "../../infra/providers/custody-options-prisma.provider"
import type { ICategoryQueries } from "@/modules/categories/application/interfaces/category-queries.interface"
import { CategoryMapper } from "@/modules/categories/infra/mappers/category.mapper"

describe("GetOperationOptionsUseCase, GetCustodyOptionsUseCase & Category Options", () => {
  const dummySession: SessionPayload = {
    partyId: 1,
    contextId: 10,
  }

  const mockSpaceAccessAllowed: ISpaceAccessProvider = {
    execute: async () =>
      success({
        canViewBalances: true,
        canManageBalances: true,
      }),
  }

  const mockSpaceAccessForbidden: ISpaceAccessProvider = {
    execute: async () =>
      success({
        canViewBalances: false,
        canManageBalances: false,
      }),
  }

  const mockSpaceAccessError: ISpaceAccessProvider = {
    execute: async () => failure("Vínculo não encontrado"),
  }

  const dummyCustodyProvider: ICustodyOptionsProvider = {
    listCustodyOptions: async () => [
      {
        id: 1,
        name: "Carteira Itaú",
        type: "WALLET",
        subtitle: "Carteira",
      },
    ],
  }

  const dummyCategoryProvider: ICategoryOptionsProvider = {
    listCategoryOptions: async () => [
      {
        id: 100,
        name: "Alimentação",
        icon: "Utensils",
        color: "#F97316",
      },
    ],
  }

  const dummySubcategoryProvider: ISubcategoryOptionsProvider = {
    listSubcategoryOptions: async () => [
      {
        id: 1001,
        parentId: 100,
        parentName: "Alimentação",
        name: "Supermercado",
        icon: "ShoppingCart",
        color: "#F97316",
      },
    ],
  }

  it("retorna erro quando o acesso ao contexto financeiro é negado", async () => {
    const useCase = new GetOperationOptionsUseCase(
      mockSpaceAccessError,
      dummyCustodyProvider,
      dummyCategoryProvider,
      dummySubcategoryProvider
    )

    const result = await useCase.execute({ session: dummySession })
    assert.equal(result.success, false)
    if (!result.success) {
      assert.equal(result.error, "Vínculo não encontrado")
    }
  })

  it("retorna erro quando o usuário não possui permissão canViewBalances", async () => {
    const useCase = new GetOperationOptionsUseCase(
      mockSpaceAccessForbidden,
      dummyCustodyProvider,
      dummyCategoryProvider,
      dummySubcategoryProvider
    )

    const result = await useCase.execute({ session: dummySession })
    assert.equal(result.success, false)
    if (!result.success) {
      assert.match(result.error, /Sem permissão para visualizar as opções financeiras/)
    }
  })

  it("retorna as opções agregadas com sucesso e valida contra OperationOptionsSchema", async () => {
    const useCase = new GetOperationOptionsUseCase(
      mockSpaceAccessAllowed,
      dummyCustodyProvider,
      dummyCategoryProvider,
      dummySubcategoryProvider
    )

    const result = await useCase.execute({ session: dummySession })
    assert.equal(result.success, true)
    if (result.success) {
      assert.equal(result.data.custodies.length, 1)
      assert.equal(result.data.custodies[0].name, "Carteira Itaú")
      assert.equal(result.data.categories.length, 1)
      assert.equal(result.data.categories[0].name, "Alimentação")
      assert.equal(result.data.subcategories.length, 1)
      assert.equal(result.data.subcategories[0].name, "Supermercado")
      assert.equal(result.data.subcategories[0].parentId, 100)

      const validation = OperationOptionsSchema.safeParse(result.data)
      assert.ok(validation.success)
    }
  })

  it("GetCustodyOptionsUseCase retorna meios de pagamento autorizados", async () => {
    const custodyUseCase = new GetCustodyOptionsUseCase(
      mockSpaceAccessAllowed,
      dummyCustodyProvider
    )

    const result = await custodyUseCase.execute({ session: dummySession })
    assert.equal(result.success, true)
    if (result.success) {
      assert.equal(result.data.length, 1)
      assert.equal(result.data[0].name, "Carteira Itaú")
      assert.equal(result.data[0].type, "WALLET")
      const parsed = CustodyOptionSchema.safeParse(result.data[0])
      assert.ok(parsed.success)
    }
  })

  it("GetCustodyOptionsUseCase falha se não tiver permissão", async () => {
    const custodyUseCase = new GetCustodyOptionsUseCase(
      mockSpaceAccessForbidden,
      dummyCustodyProvider
    )

    const result = await custodyUseCase.execute({ session: dummySession })
    assert.equal(result.success, false)
    if (!result.success) {
      assert.match(result.error, /Sem permissão para visualizar os meios de pagamento/)
    }
  })

  it("CustodyOptionsPrismaProvider retorna vazio para spaceId inválido", async () => {
    const provider = new CustodyOptionsPrismaProvider()
    const emptyZero = await provider.listCustodyOptions(0)
    const emptyNegative = await provider.listCustodyOptions(-5)
    const emptyUndefined = await provider.listCustodyOptions(undefined)

    assert.deepEqual(emptyZero, [])
    assert.deepEqual(emptyNegative, [])
    assert.deepEqual(emptyUndefined, [])
  })

  it("CategoryOptionsPrismaProvider retorna vazio para contextId inválido", async () => {
    let called = false
    const mockQueries: ICategoryQueries = {
      listRootCategories: async () => ({
        data: [],
        total: 0,
        pageIndex: 0,
        pageSize: 6,
        pageCount: 1,
      }),
      listCategoryChildren: async () => [],
      findCategoryById: async () => null,
      listArchivedCategories: async () => [],
      listActiveCategoryOptions: async () => {
        called = true
        return []
      },
      listActiveSubcategoryOptions: async () => {
        called = true
        return []
      },
    }

    const provider = new CategoryOptionsPrismaProvider(mockQueries)
    const catsZero = await provider.listCategoryOptions(0)
    const subsZero = await provider.listSubcategoryOptions(-1)
    const catsUndefined = await provider.listCategoryOptions(undefined)

    assert.deepEqual(catsZero, [])
    assert.deepEqual(subsZero, [])
    assert.deepEqual(catsUndefined, [])
    assert.equal(called, false)
  })

  it("CategoryMapper herda ícone e cor do pai na subcategoria quando filha não possui", () => {
    const subWithoutAppearance = CategoryMapper.toSubcategoryOption({
      id: 50,
      parentId: 10,
      name: "Padaria",
      appearance: null,
      parent: {
        id: 10,
        name: "Alimentação",
        appearance: {
          icon: "Utensils",
          color: "#EF4444",
        },
      },
    })

    assert.equal(subWithoutAppearance.name, "Padaria")
    assert.equal(subWithoutAppearance.parentName, "Alimentação")
    assert.equal(subWithoutAppearance.icon, "Utensils")
    assert.equal(subWithoutAppearance.color, "#EF4444")

    const validation = SubcategoryOptionSchema.safeParse(subWithoutAppearance)
    assert.ok(validation.success)
  })

  it("CategoryMapper preserva ícone e cor próprios da subcategoria quando definidos", () => {
    const subWithAppearance = CategoryMapper.toSubcategoryOption({
      id: 51,
      parentId: 10,
      name: "Cafeteria Especial",
      appearance: {
        icon: "Coffee",
        color: "#B45309",
      },
      parent: {
        id: 10,
        name: "Alimentação",
        appearance: {
          icon: "Utensils",
          color: "#EF4444",
        },
      },
    })

    assert.equal(subWithAppearance.icon, "Coffee")
    assert.equal(subWithAppearance.color, "#B45309")

    const validation = SubcategoryOptionSchema.safeParse(subWithAppearance)
    assert.ok(validation.success)
  })

  it("CategoryMapper mapeia categoria raiz corretamente", () => {
    const cat = CategoryMapper.toCategoryOption({
      id: 10,
      name: "Moradia",
      appearance: {
        icon: "Home",
        color: "#3B82F6",
      },
    })

    assert.equal(cat.id, 10)
    assert.equal(cat.name, "Moradia")
    assert.equal(cat.icon, "Home")
    assert.equal(cat.color, "#3B82F6")

    const validation = CategoryOptionSchema.safeParse(cat)
    assert.ok(validation.success)
  })
})
