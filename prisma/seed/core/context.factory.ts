import {
  BalanceType,
  ContextMemberRole,
  ContextMemberStatus,
  CycleFrequency,
  EntryType,
  MovementDirection,
} from "../../generated/prisma/enums";
import type { PrismaClientInstance } from "./helpers";

export interface WalletSeedInput {
  name: string;
  type?: BalanceType;
  initialBalance?: {
    amount: number;
    direction?: MovementDirection;
    date?: string | Date;
  };
}

export interface CreditCardSeedInput {
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  isArchived?: boolean;
  startsAt?: string | Date;
  initialExpenses?: Array<{
    description: string;
    amount: number;
    date?: string | Date;
    categoryId?: number;
  }>;
}

export class FinancialContextFactory {
  constructor(
    private readonly prisma: PrismaClientInstance,
    public readonly contextId: number,
    public readonly ownerPartyId: number
  ) {}

  async addMember(params: {
    partyId: number;
    role?: ContextMemberRole;
    status?: ContextMemberStatus;
    invitedByPartyId?: number;
    invitedAt?: Date;
  }) {
    const status = params.status ?? ContextMemberStatus.ACTIVE;
    const invitedAt = params.invitedAt ?? new Date();

    return this.prisma.contextMember.create({
      data: {
        contextId: this.contextId,
        partyId: params.partyId,
        invitedByPartyId: params.invitedByPartyId ?? this.ownerPartyId,
        role: params.role ?? ContextMemberRole.MEMBER,
        status,
        invitedAt,
        joinedAt: status !== ContextMemberStatus.PENDING ? new Date() : null,
        removedAt: status === ContextMemberStatus.REMOVED ? new Date() : null,
      },
    });
  }

  async addWallet(params: WalletSeedInput) {
    const balance = await this.prisma.balance.create({
      data: {
        contextId: this.contextId,
        name: params.name,
        balanceType: params.type ?? BalanceType.WALLET,
      },
    });

    if (params.initialBalance && params.initialBalance.amount > 0) {
      await this.addDirectEntry({
        balanceId: balance.id,
        description: `Saldo Inicial - ${params.name}`,
        amount: params.initialBalance.amount,
        direction: params.initialBalance.direction ?? MovementDirection.CREDIT,
        date: params.initialBalance.date,
      });
    }

    return balance;
  }

  async addWallets(items: WalletSeedInput[]) {
    return Promise.all(items.map((item) => this.addWallet(item)));
  }

  async addCategory(name: string, type: BalanceType = BalanceType.CATEGORY) {
    return this.prisma.balance.create({
      data: { contextId: this.contextId, name, balanceType: type },
    });
  }

  async addCreditCard(params: CreditCardSeedInput) {
    const startDate = params.startsAt ? new Date(params.startsAt) : new Date(2026, 0, 1);

    const card = await this.prisma.balance.create({
      data: {
        contextId: this.contextId,
        name: params.name,
        balanceType: BalanceType.CREDIT,
        removedAt: params.isArchived ? new Date() : null,
        limitEntries: {
          create: {
            amount: params.limit,
            effectiveAt: startDate,
            reason: "Limite Inicial",
          },
        },
        recurrence: {
          create: {
            startsAt: startDate,
            includeInProjection: true,
            rules: {
              create: {
                closingDay: params.closingDay,
                dueDay: params.dueDay,
                frequency: CycleFrequency.MONTHLY,
                interval: 1,
                effectiveFrom: startDate,
              },
            },
          },
        },
      },
    });

    if (params.initialExpenses?.length) {
      await Promise.all(
        params.initialExpenses.map((exp) =>
          this.addDirectEntry({
            balanceId: card.id,
            counterpartBalanceId: exp.categoryId,
            description: exp.description,
            amount: exp.amount,
            direction: MovementDirection.DEBIT,
            date: exp.date,
          })
        )
      );
    }

    return card;
  }

  async addCreditCards(items: CreditCardSeedInput[]) {
    return Promise.all(items.map((item) => this.addCreditCard(item)));
  }

  async addDirectEntry(params: {
    balanceId: number;
    counterpartBalanceId?: number;
    description: string;
    amount: number;
    direction: MovementDirection;
    type?: EntryType;
    date?: string | Date;
  }) {
    const movements = [
      {
        balanceId: params.balanceId,
        amount: params.amount,
        direction: params.direction,
      },
    ];

    if (params.counterpartBalanceId) {
      movements.push({
        balanceId: params.counterpartBalanceId,
        amount: params.amount,
        direction:
          params.direction === MovementDirection.DEBIT
            ? MovementDirection.CREDIT
            : MovementDirection.DEBIT,
      });
    }

    return this.prisma.entry.create({
      data: {
        description: params.description,
        date: params.date ? new Date(params.date) : new Date(),
        type: params.type ?? EntryType.DIRECT,
        movements: { create: movements },
      },
    });
  }
}