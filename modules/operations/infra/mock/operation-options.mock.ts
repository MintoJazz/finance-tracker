import type {
  ICategoryOptionsProvider,
  ICreditCycleOptionsProvider,
  ICustodyOptionsProvider,
  ISubcategoryOptionsProvider,
} from "../../application/interfaces/operation-options-provider.interface"
import type {
  CategoryOption,
  CreditCycleOption,
  CustodyOption,
  OperationOptions,
  SubcategoryOption,
} from "../../models/operation-options.schema"

export const MOCK_CUSTODY_OPTIONS: CustodyOption[] = [
  {
    id: 1,
    name: "Itaú Unibanco",
    type: "WALLET",
    subtitle: "Carteira • Saldo R$ 4.852,00",
    icon: "Wallet",
    color: "#F97316",
    balanceCents: 485200,
  },
  {
    id: 2,
    name: "Nubank Ultravioleta",
    type: "CREDIT",
    subtitle: "Cartão de crédito",
    icon: "CreditCard",
    color: "#8B5CF6",
  },
  {
    id: 3,
    name: "XP Visa Infinite",
    type: "CREDIT",
    subtitle: "Cartão de crédito",
    icon: "CreditCard",
    color: "#0EA5E9",
  },
  {
    id: 4,
    name: "Reserva de Emergência",
    type: "RESERVE",
    subtitle: "Reserva • Saldo R$ 12.500,00",
    icon: "PiggyBank",
    color: "#10B981",
    balanceCents: 1250000,
  },
  {
    id: 5,
    name: "Caixa em Espécie",
    type: "WALLET",
    subtitle: "Carteira física • Saldo R$ 320,00",
    icon: "Banknote",
    color: "#22C55E",
    balanceCents: 32000,
  },
]

export const MOCK_CREDIT_CYCLE_OPTIONS: CreditCycleOption[] = [
  {
    cardBalanceId: 2,
    title: "Aberta • Nov/2026",
    subtitle: "Fecha em 10/11 • Vence em 17/11",
    closingDate: "2026-11-10",
    dueDate: "2026-11-17",
    status: "OPEN",
  },
  {
    cardBalanceId: 2,
    title: "Futura • Dez/2026",
    subtitle: "Fecha em 10/12 • Vence em 17/12",
    closingDate: "2026-12-10",
    dueDate: "2026-12-17",
    status: "FUTURE",
  },
  {
    cardBalanceId: 3,
    title: "Aberta • Nov/2026",
    subtitle: "Fecha em 21/11 • Vence em 28/11",
    closingDate: "2026-11-21",
    dueDate: "2026-11-28",
    status: "OPEN",
  },
  {
    cardBalanceId: 3,
    title: "Futura • Dez/2026",
    subtitle: "Fecha em 21/12 • Vence em 28/12",
    closingDate: "2026-12-21",
    dueDate: "2026-12-28",
    status: "FUTURE",
  },
]

export const MOCK_CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 101,
    name: "Alimentação",
    icon: "Utensils",
    color: "#10B981",
  },
  {
    id: 102,
    name: "Moradia",
    icon: "Home",
    color: "#6366F1",
  },
  {
    id: 103,
    name: "Transporte",
    icon: "Car",
    color: "#EC4899",
  },
  {
    id: 104,
    name: "Tecnologia",
    icon: "Laptop",
    color: "#8B5CF6",
  },
  {
    id: 105,
    name: "Receitas",
    icon: "Briefcase",
    color: "#0EA5E9",
  },
]

export const MOCK_SUBCATEGORY_OPTIONS: SubcategoryOption[] = [
  {
    id: 1011,
    parentId: 101,
    name: "Supermercado",
    parentName: "Alimentação",
    icon: "ShoppingCart",
    color: "#10B981",
  },
  {
    id: 1012,
    parentId: 101,
    name: "Delivery",
    parentName: "Alimentação",
    icon: "Pizza",
    color: "#10B981",
  },
  {
    id: 1013,
    parentId: 101,
    name: "Padaria",
    parentName: "Alimentação",
    icon: "Coffee",
    color: "#10B981",
  },
  {
    id: 1021,
    parentId: 102,
    name: "Aluguel",
    parentName: "Moradia",
    icon: "Home",
    color: "#6366F1",
  },
  {
    id: 1022,
    parentId: 102,
    name: "Energia",
    parentName: "Moradia",
    icon: "Zap",
    color: "#6366F1",
  },
  {
    id: 1031,
    parentId: 103,
    name: "Combustível",
    parentName: "Transporte",
    icon: "Fuel",
    color: "#EC4899",
  },
  {
    id: 1032,
    parentId: 103,
    name: "Uber & Táxi",
    parentName: "Transporte",
    icon: "Car",
    color: "#EC4899",
  },
]

export const MOCK_OPERATION_OPTIONS: OperationOptions = {
  custodies: MOCK_CUSTODY_OPTIONS,
  creditCycles: MOCK_CREDIT_CYCLE_OPTIONS,
  categories: MOCK_CATEGORY_OPTIONS,
  subcategories: MOCK_SUBCATEGORY_OPTIONS,
}

export class OperationOptionsMockService
  implements
    ICustodyOptionsProvider,
    ICreditCycleOptionsProvider,
    ICategoryOptionsProvider,
    ISubcategoryOptionsProvider
{
  async listCustodyOptions(_spaceId?: number): Promise<CustodyOption[]> {
    return MOCK_CUSTODY_OPTIONS
  }

  async listCreditCycleOptions(_spaceId?: number): Promise<CreditCycleOption[]> {
    return MOCK_CREDIT_CYCLE_OPTIONS
  }

  async listCategoryOptions(_spaceId?: number): Promise<CategoryOption[]> {
    return MOCK_CATEGORY_OPTIONS
  }

  async listSubcategoryOptions(_spaceId?: number): Promise<SubcategoryOption[]> {
    return MOCK_SUBCATEGORY_OPTIONS
  }
}

