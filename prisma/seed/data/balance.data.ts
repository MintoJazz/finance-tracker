import { BalanceType, MovementDirection } from "../../generated/prisma/enums";
import type { BalanceFixture } from "../types";

// Lista estendida para a Ana (30 carteiras para testar paginação e infinite scroll)
const anaPaginationBalances: BalanceFixture[] = [
  {
    ownerEmail: "ana@teste.com",
    name: "Conta Nubank",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 250000, date: "2026-08-01T10:00:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Carteira Física",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 15000, date: "2026-08-03T14:30:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Conta Itaú Uniclass",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 480050, date: "2026-08-05T09:15:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Reserva de Emergência (Tesouro Selic)",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 1500000, date: "2026-08-07T11:20:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Banco Inter",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 89000, date: "2026-08-09T16:45:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "PicPay",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 12500, date: "2026-08-11T08:10:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Mercado Pago",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 34200, date: "2026-08-13T19:00:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "C6 Bank",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 110000, date: "2026-08-15T12:00:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Caixinha Viagem Europa",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 620000, date: "2026-08-17T15:30:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Caixinha Troca de Notebook",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 310000, date: "2026-08-19T10:40:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Wise (Dólar - USD)",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 450000, date: "2026-08-21T14:00:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Wise (Euro - EUR)",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 380000, date: "2026-08-23T14:05:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Nomad Global",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 195000, date: "2026-08-25T17:50:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "XP Investimentos - Conta Corrente",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 75000, date: "2026-08-27T09:00:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "BTG Pactual Banking",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 540000, date: "2026-08-29T13:15:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: " Rico Corretora",
    balanceType: BalanceType.WALLET,
  }, // Sem saldo inicial (testar renderização de saldo R$ 0,00)
  {
    ownerEmail: "ana@teste.com",
    name: "Cartão Caju (Benefícios)",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 85000, date: "2026-09-01T08:00:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Flash Benefícios",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 60000, date: "2026-09-02T08:30:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Alelo Refeição",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 42000, date: "2026-09-04T12:15:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Ticket Alimentação",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 55000, date: "2026-09-06T18:20:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Binance (Spot Wallet)",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 215000, date: "2026-09-08T21:00:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Hardware Wallet (Ledger)",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 890000, date: "2026-09-10T22:10:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Cofre de Moedas em Casa",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 4350, date: "2026-09-12T11:00:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Conta Conjunta Despesas Casa",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 180000, date: "2026-09-14T10:00:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Fundo IPVA e Seguro Auto",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 275000, date: "2026-09-16T15:45:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Poupança Antiga Caixa",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 5000, date: "2026-09-18T09:30:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "Conta Santander Van Gogh",
    balanceType: BalanceType.WALLET,
    initialBalance: {
      amount: 35000,
      direction: MovementDirection.DEBIT, // Testar carteira iniciando no cheque especial/negativa
      date: "2026-09-20T14:00:00Z",
    },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "PayPal",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 18900, date: "2026-09-22T16:10:00Z" },
  },
  {
    ownerEmail: "ana@teste.com",
    name: "RecargaPay",
    balanceType: BalanceType.WALLET,
  }, // Carteira zerada
  {
    ownerEmail: "ana@teste.com",
    name: "Conta MEI (Cora)",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 740000, date: "2026-09-28T11:00:00Z" },
  },
];

export const balancesFixture: BalanceFixture[] = [
  ...anaPaginationBalances,

  // Bruno
  {
    ownerEmail: "bruno@teste.com",
    name: "Banco Inter",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 320000, date: "2026-09-02T11:00:00Z" },
  },
  {
    ownerEmail: "bruno@teste.com",
    name: "PicPay",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 45000 },
  },

  // Carla
  {
    ownerEmail: "carla@teste.com",
    name: "Conta Santander",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 610000, date: "2026-09-12T16:20:00Z" },
  },
  {
    ownerEmail: "carla@teste.com",
    name: "C6 Bank",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 125000, date: "2026-09-15T08:00:00Z" },
  },
  {
    ownerEmail: "carla@teste.com",
    name: "Dinheiro em Espécie",
    balanceType: BalanceType.WALLET,
  },

  // Diego
  {
    ownerEmail: "diego@teste.com",
    name: "Conta Bradesco",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 185000, date: "2026-09-18T13:45:00Z" },
  },
  {
    ownerEmail: "diego@teste.com",
    name: "Mercado Pago",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 78000, date: "2026-09-20T19:00:00Z" },
  },

  // Eduarda
  {
    ownerEmail: "eduarda@teste.com",
    name: "Conta Nubank",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 95000, date: "2026-09-22T10:10:00Z" },
  },
  {
    ownerEmail: "eduarda@teste.com",
    name: "Caixa Econômica",
    balanceType: BalanceType.WALLET,
    initialBalance: { amount: 210000, date: "2026-09-25T15:00:00Z" },
  },
];