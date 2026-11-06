import type { OperationSeed } from "../../models/operation-seed.schema"
import type { OperationLookupData } from "../components/operation-wizard/types"

export const PLAYGROUND_LOOKUPS: OperationLookupData = {
  custodies: [
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
  ],

  creditCycles: [
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
  ],

  categories: [
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
  ],

  subcategories: [
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
  ],

  commitments: [
    {
      id: 501,
      title: "Aluguel Nov/2026",
      counterparty: "Imobiliária",
      balanceType: "PAYABLE",
      suggestedAmountCents: 280000,
      dueDate: "2026-11-10",
      icon: "Home",
    },
    {
      id: 502,
      title: "Energia Out/2026",
      counterparty: "Enel",
      balanceType: "PAYABLE",
      suggestedAmountCents: 34590,
      dueDate: "2026-11-12",
      icon: "Zap",
    },
    {
      id: 503,
      title: "Internet Fibra",
      counterparty: "Vivo",
      balanceType: "PAYABLE",
      suggestedAmountCents: 14990,
      dueDate: "2026-11-15",
      icon: "Wifi",
    },
    {
      id: 601,
      title: "Consultoria Out/2026",
      counterparty: "Acme Corp",
      balanceType: "RECEIVABLE",
      suggestedAmountCents: 450000,
      dueDate: "2026-11-10",
      icon: "Briefcase",
    },
    {
      id: 602,
      title: "Aluguel Sala Comercial",
      counterparty: "Inquilino Centro",
      balanceType: "RECEIVABLE",
      suggestedAmountCents: 185000,
      dueDate: "2026-11-15",
      icon: "Building2",
    },
  ],

  reimbursementTargets: [
    {
      id: "contact_joao",
      name: "João Silva",
      type: "CONTACT",
      subtitle: "Amigo • Reembolso individual",
      icon: "UserRound",
      color: "#0EA5E9",
    },
    {
      id: "contact_maria",
      name: "Maria Oliveira",
      type: "CONTACT",
      subtitle: "Amigo • Reembolso individual",
      icon: "UserRound",
      color: "#EC4899",
    },
    {
      id: "group_viagem",
      name: "Viagem Praia",
      type: "GROUP",
      subtitle: "Grupo • 4 integrantes (Lucas, Ana, Pedro, Clara)",
      icon: "Users",
      color: "#8B5CF6",
      members: [
        { id: "m_lucas", name: "Lucas" },
        { id: "m_ana", name: "Ana" },
        { id: "m_pedro", name: "Pedro" },
        { id: "m_clara", name: "Clara" },
      ],
    },
    {
      id: "group_republica",
      name: "República",
      type: "GROUP",
      subtitle: "Grupo • 3 integrantes (Bruno, Carla, Diego)",
      icon: "Users",
      color: "#10B981",
      members: [
        { id: "m_bruno", name: "Bruno" },
        { id: "m_carla", name: "Carla" },
        { id: "m_diego", name: "Diego" },
      ],
    },
  ],
}

export interface PlaygroundSeedPreset {
  id: string
  label: string
  description: string
  seed: OperationSeed
}

export const PLAYGROUND_SEED_PRESETS: readonly PlaygroundSeedPreset[] = [
  {
    id: "empty",
    label: "1. Sem Seed (Fluxo Completo)",
    description: "Começa no passo 1000 (Natureza).",
    seed: {},
  },
  {
    id: "pay-wallet",
    label: "2. Seed Pagar + Carteira Itaú",
    description:
      "Pula o passo 1000 (skipWhen por seed.nature) e pré-seleciona a Carteira Itaú.",
    seed: {
      nature: "PAY",
      custodyBalanceId: 1,
      custodyType: "WALLET",
    },
  },
  {
    id: "pay-card",
    label: "3. Seed Pagar + Cartão Nubank",
    description:
      "Pula 1000, pré-seleciona o Cartão Nubank e ativa declarativamente o passo 2100 (Fatura).",
    seed: {
      nature: "PAY",
      custodyBalanceId: 2,
      custodyType: "CREDIT",
      competanceDate: "2026-11-10",
    },
  },
  {
    id: "settle-deeplink",
    label: "4. Deep Link Quitar Compromisso",
    description:
      "Pula 1000, ativa DEMO_SETTLE (adiciona 1500 e remove Categoria/Subcategoria).",
    seed: {
      nature: "PAY",
      intents: ["DEMO_SETTLE"],
    },
  },
]
