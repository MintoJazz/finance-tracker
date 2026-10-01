import type { BalanceType, MovementDirection } from "../generated/prisma/enums";

export interface UserFixture {
  name: string;
  email: string;
  birthDate?: string;
  phone?: string;
  defaultContextName: string;
}

export interface BalanceFixture {
  ownerEmail: string;
  name: string;
  balanceType: BalanceType;
  initialBalance?: {
    amount: number;
    direction?: MovementDirection;
    date?: string;
  };
}

export interface CardFixture {
  ownerEmail: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  startsAt?: string;
  isArchived?: boolean;
  initialExpenses?: {
    description: string;
    amount: number;
    date?: string;
  }[];
}