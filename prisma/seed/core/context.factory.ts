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
  isArchived?: boolean;
  createdAt?: string | Date;
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
        createdAt: params.createdAt ? new Date(params.createdAt) : undefined,
        removedAt: params.isArchived ? new Date() : null,
      },
    });

    if (params.initialBalance && params.initialBalance.amount > 0) {
      await this.addDirectEntry({
        balanceId: balance.id,
        description: `Saldo Inicial - ${params.name}`,
        amount: params.initialBalance.amount,
        direction: params.initialBalance.direction ?? MovementDirection.CREDIT,
        type: EntryType.ADJUSTMENT,
        date: params.initialBalance.date,
      });
    }

    return balance;
  }

  async addWallets(items: WalletSeedInput[]) {
    // Executa em série para preservar a ordem determinística dos IDs (1, 2, 3...)
    const results = [];
    for (const item of items) {
      results.push(await this.addWallet(item));
    }
    return results;
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
      for (const exp of params.initialExpenses) {
        await this.addDirectEntry({
          balanceId: card.id,
          counterpartBalanceId: exp.categoryId,
          description: exp.description,
          amount: exp.amount,
          direction: MovementDirection.DEBIT,
          date: exp.date,
          keepPositiveOnDebit: true, // Em cartão (CREDIT), usedLimit soma o valor positivo das despesas
        });
      }
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
    keepPositiveOnDebit?: boolean;
  }) {
    const absAmount = Math.abs(params.amount);
    const signedAmount =
      params.direction === MovementDirection.DEBIT && !params.keepPositiveOnDebit
        ? -absAmount
        : absAmount;

    const movements = [
      {
        balanceId: params.balanceId,
        amount: signedAmount,
        direction: params.direction,
      },
    ];

    if (params.counterpartBalanceId) {
      const counterpartDirection =
        params.direction === MovementDirection.DEBIT
          ? MovementDirection.CREDIT
          : MovementDirection.DEBIT;

      movements.push({
        balanceId: params.counterpartBalanceId,
        amount: -signedAmount,
        direction: counterpartDirection,
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

  async addTransfer(params: {
    fromBalanceId: number;
    toBalanceId: number;
    description: string;
    amount: number;
    date?: string | Date;
  }) {
    const absAmount = Math.abs(params.amount);
    return this.prisma.entry.create({
      data: {
        description: params.description,
        date: params.date ? new Date(params.date) : new Date(),
        type: EntryType.TRANSFER,
        movements: {
          create: [
            {
              balanceId: params.fromBalanceId,
              amount: -absAmount,
              direction: MovementDirection.DEBIT,
            },
            {
              balanceId: params.toBalanceId,
              amount: absAmount,
              direction: MovementDirection.CREDIT,
            },
          ],
        },
      },
    });
  }

  async reverseEntry(params: {
    originalEntryId: number;
    balanceId: number;
    counterpartBalanceId?: number;
    description: string;
    amount: number;
    originalDirection: MovementDirection;
    date?: string | Date;
  }) {
    const absAmount = Math.abs(params.amount);
    const reversalDirection =
      params.originalDirection === MovementDirection.DEBIT
        ? MovementDirection.CREDIT
        : MovementDirection.DEBIT;

    // Como o original ainda existe na tabela Movement, o estorno precisa anular a soma
    // ou compensar o lançamento original
    const signedReversalAmount =
      reversalDirection === MovementDirection.DEBIT ? -absAmount : absAmount;

    const movements = [
      {
        balanceId: params.balanceId,
        amount: signedReversalAmount,
        direction: reversalDirection,
      },
    ];

    if (params.counterpartBalanceId) {
      movements.push({
        balanceId: params.counterpartBalanceId,
        amount: -signedReversalAmount,
        direction: params.originalDirection,
      });
    }

    return this.prisma.entry.create({
      data: {
        description: params.description,
        date: params.date ? new Date(params.date) : new Date(),
        type: EntryType.REVERSAL,
        reversesEntryId: params.originalEntryId,
        movements: { create: movements },
      },
    });
  }
}