import { ContractSummaryItem } from "../../core/schemas/contract.schema";

export const mockContracts: ContractSummaryItem[] = [
  {
    id: 1,
    balanceId: 101,
    name: "Aluguel",
    type: "PAYABLE",
    value: 150000, // R$ 1500,00
    frequency: "MONTHLY",
    dueDay: 5,
    startsAt: new Date("2023-01-01T00:00:00Z"),
    endsAt: null,
    includeInProjection: true,
    isArchived: false,
  },
  {
    id: 2,
    balanceId: 102,
    name: "Salário",
    type: "RECEIVABLE",
    value: 500000, // R$ 5000,00
    frequency: "MONTHLY",
    dueDay: 5,
    startsAt: new Date("2023-01-01T00:00:00Z"),
    endsAt: null,
    includeInProjection: true,
    isArchived: false,
  },
  {
    id: 3,
    balanceId: 103,
    name: "Financiamento Carro",
    type: "PAYABLE",
    value: 80000, // R$ 800,00
    frequency: "MONTHLY",
    dueDay: 15,
    startsAt: new Date("2022-06-01T00:00:00Z"),
    endsAt: new Date("2026-06-01T00:00:00Z"),
    includeInProjection: true,
    isArchived: false,
  },
  {
    id: 4,
    balanceId: 104,
    name: "Academia",
    type: "PAYABLE",
    value: 12000, // R$ 120,00
    frequency: "MONTHLY",
    dueDay: 20,
    startsAt: new Date("2024-01-01T00:00:00Z"),
    endsAt: null,
    includeInProjection: false,
    isArchived: false,
  },
  {
    id: 5,
    balanceId: 105,
    name: "Empréstimo João",
    type: "RECEIVABLE",
    value: 20000, // R$ 200,00
    frequency: "MONTHLY",
    dueDay: 10,
    startsAt: new Date("2023-10-01T00:00:00Z"),
    endsAt: new Date("2024-10-01T00:00:00Z"),
    includeInProjection: false,
    isArchived: true,
  }
];
