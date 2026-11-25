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
  installments: {
    pattern: "/installments",
    label: "Parcelamentos",
  },
  installmentCreate: {
    pattern: "/installments/create",
    label: "Novo parcelamento",
    parent: "installments",
  },
  installmentEdit: {
    pattern: "/installments/[id]/edit",
    label: "Editar nome",
    parent: "installments",
  },
  installmentChangeCategory: {
    pattern: "/installments/[id]/change-category",
    label: "Trocar categoria",
    parent: "installments",
  },
  installmentAdjustValues: {
    pattern: "/installments/[id]/adjust-values",
    label: "Ajustar valores e parcelas",
    parent: "installments",
  },
  installmentAdjustDeadlines: {
    pattern: "/installments/[id]/adjust-deadlines",
    label: "Ajustar prazos",
    parent: "installments",
  },
  installmentChangeCard: {
    pattern: "/installments/[id]/change-card",
    label: "Trocar cartão",
    parent: "installments",
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