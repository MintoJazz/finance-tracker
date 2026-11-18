// components/header/config.ts
import { RouteDefinition } from "./types"

export function defineRoutes<const T extends Record<string, RouteDefinition<Extract<keyof T, string>>>>(r: T) {
  return r
}

export const routes = defineRoutes({
  wallets: {
    pattern: "/wallets",
    label: "Carteiras",
  },
  walletCreate: {
    pattern: "/wallets/create",
    label: "Nova carteira",
    parent: "wallets",
  },
  walletProfile: {
    pattern: "/wallets/[id]",
    label: () => "",
    parent: "wallets",
  },
  walletEdit: {
    pattern: "/wallets/[id]/edit",
    label: "Editar",
    parent: "walletProfile",
  },
  cards: {
    pattern: "/cards",
    label: "Cartões",
  },
  cardCreate: {
    pattern: "/cards/create",
    label: "Novo cartão",
    parent: "cards",
  },
  cardProfile: {
    pattern: "/cards/[id]",
    label: () => "",
    parent: "cards",
  },
  cardEdit: {
    pattern: "/cards/[id]/edit",
    label: "Editar",
    parent: "cardProfile",
  },
  commitments: {
    pattern: "/commitments",
    label: "Meus Compromissos",
  },
  commitmentProfile: {
    pattern: "/commitments/[id]",
    label: () => "",
    parent: "commitments",
  },
  contracts: {
    pattern: "/contracts",
    label: "Contratos",
  },
  recurrences: {
    pattern: "/recurrences",
    label: "Recorrências",
  },
  recurrenceCreate: {
    pattern: "/recurrences/create",
    label: "Nova recorrência",
    parent: "recurrences",
  },
  recurrenceArchived: {
    pattern: "/recurrences/archived",
    label: "Recorrências Arquivadas",
    parent: "recurrences",
  },
  recurrenceProfile: {
    pattern: "/recurrences/[id]",
    label: () => "",
    parent: "recurrences",
  },
  contractProfile: {
    pattern: "/contracts/[id]",
    label: () => "",
    parent: "contracts",
  },
  contractEdit: {
    pattern: "/contracts/[id]/edit",
    label: "Editar",
    parent: "contractProfile",
  },
  contractCycle: {
    pattern: "/contracts/[id]/cycle",
    label: () => "",
    parent: "contractProfile",
  },
  categories: {
    pattern: "/categories",
    label: "Categorias",
  },
  categoryCreate: {
    pattern: "/categories/create",
    label: "Nova categoria",
    parent: "categories",
  },
  categoryArchived: {
    pattern: "/categories/archived",
    label: "Categorias Arquivadas",
    parent: "categories",
  },
  categoryDetail: {
    pattern: "/categories/[id]",
    label: () => "",
    parent: "categories",
  },
  operations: {
    pattern: "/operations",
    label: "Operações",
  },
  operationNew: {
    pattern: "/operations/new",
    label: "Nova Operação",
    parent: "operations",
  },
  operationsPlayground: {
    pattern: "/operations/playground",
    label: "Playground de Operações",
    parent: "operations",
  },
})

export type RouteKey = keyof typeof routes