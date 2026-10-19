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

export interface CycleRuleSeedInput {
  effectiveFrom: string | Date;
  frequency?: CycleFrequency;
  interval?: number;
  closingDay?: number | null;
  dueDay: number;
}

export interface CreditCardSeedInput {
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  isArchived?: boolean;
  startsAt?: string | Date;
  endsAt?: string | Date | null;
  extraRules?: CycleRuleSeedInput[];
  limitEntries?: Array<{
    amount: number;
    effectiveAt: string | Date;
    reason?: string;
  }>;
  initialExpenses?: Array<{
    description: string;
    amount: number;
    date?: string | Date;
    competanceDate?: string | Date;
    categoryId?: number;
  }>;
}

export interface CommitmentAgreementSeedInput {
  name: string;
  balanceType?: BalanceType; // Default: PAYABLE (pode ser RECEIVABLE no futuro)
  categoryId?: number;
  appearance?: {
    icon?: string | null;
    color?: string | null;
  };
  amount?: number; // Added so we can show default/expected amount in the UI
  amountEntries?: Array<{
    amount: number;
    effectiveAt: string | Date;
    reason?: string;
  }>;
  startsAt: string | Date;
  endsAt?: string | Date | null;
  includeInProjection?: boolean;
  isArchived?: boolean;
  rules: CycleRuleSeedInput[];
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
    const results = [];
    for (const item of items) {
      results.push(await this.addWallet(item));
    }
    return results;
  }

  async addCategory(
    name: string,
    options?: {
      type?: BalanceType;
      appearance?: {
        icon?: string | null;
        color?: string | null;
      };
    } | BalanceType
  ) {
    const balanceType =
      typeof options === "string" ? options : (options?.type ?? BalanceType.CATEGORY);
    const appearance =
      typeof options === "object" && options !== null ? options.appearance : undefined;

    return this.prisma.balance.create({
      data: {
        contextId: this.contextId,
        name,
        balanceType,
        appearance: appearance
          ? {
              create: {
                icon: appearance.icon ?? null,
                color: appearance.color ?? null,
              },
            }
          : undefined,
      },
      include: {
        appearance: true,
      },
    });
  }

  async addCategories(
    items: Array<{
      name: string;
      appearance?: { icon?: string | null; color?: string | null };
      type?: BalanceType;
    }>
  ) {
    const results = [];
    for (const item of items) {
      results.push(
        await this.addCategory(item.name, {
          type: item.type,
          appearance: item.appearance,
        })
      );
    }
    return results;
  }

  async addDefaultCategories() {
    return this.addCategories([
      { name: "Moradia & Contas", appearance: { icon: "house", color: "sky" } },
      { name: "Alimentação & Mercado", appearance: { icon: "utensils", color: "orange" } },
      { name: "Transporte & Combustível", appearance: { icon: "car", color: "amber" } },
      { name: "Lazer & Diversão", appearance: { icon: "party-popper", color: "violet" } },
      { name: "Saúde & Farmácia", appearance: { icon: "heart-pulse", color: "rose" } },
      { name: "Assinaturas & Serviços", appearance: { icon: "tv", color: "indigo" } },
    ]);
  }

  /**
   * Cria um Balance (por padrão COMMITMENT) acoplado a um Agreement e múltiplas CycleRules
   * para testar histórico de regras (PAST, CURRENT, FUTURE) e vigência (startsAt / endsAt).
   */
  async addCommitmentAgreement(params: CommitmentAgreementSeedInput) {
    const startDate = new Date(params.startsAt);
    const endDate = params.endsAt ? new Date(params.endsAt) : null;

    return this.prisma.balance.create({
      data: {
        contextId: this.contextId,
        name: params.name,
        balanceType: params.balanceType ?? BalanceType.PAYABLE,
        parentId: params.categoryId ?? null,
        appearance: params.appearance
          ? {
              create: {
                icon: params.appearance.icon ?? null,
                color: params.appearance.color ?? null,
              },
            }
          : undefined,
        removedAt: params.isArchived ? new Date() : null,
        agreement: {
          create: {
            startsAt: startDate,
            endsAt: endDate,
            includeInProjection: params.includeInProjection ?? true,
            rules: {
              create: params.rules.map((r) => ({
                effectiveFrom: new Date(r.effectiveFrom),
                frequency: r.frequency ?? CycleFrequency.MONTHLY,
                interval: r.interval ?? 1,
                closingDay: r.closingDay ?? null,
                dueDay: r.dueDay,
              })),
            },
            ...(params.amountEntries?.length
              ? {
                  amountEntries: {
                    create: params.amountEntries.map((e) => ({
                      amount: e.amount,
                      effectiveAt: new Date(e.effectiveAt),
                      reason: e.reason ?? "Ajuste de Valor",
                    })),
                  },
                }
              : params.amount !== undefined
                ? {
                    amountEntries: {
                      create: {
                        amount: params.amount,
                        effectiveAt: startDate,
                        reason: "Valor Inicial",
                      },
                    },
                  }
                : {}),
          },
        },
      },
      include: {
        agreement: { include: { rules: true } },
      },
    });
  }

  async addCommitmentAgreements(items: CommitmentAgreementSeedInput[]) {
    const results = [];
    for (const item of items) {
      results.push(await this.addCommitmentAgreement(item));
    }
    return results;
  }

  async addAmountDelta(params: {
    agreementId?: number;
    balanceId?: number;
    amount: number;
    effectiveAt: string | Date;
    reason?: string;
  }) {
    let targetAgreementId = params.agreementId;

    if (!targetAgreementId && params.balanceId) {
      const agreement = await this.prisma.agreement.findUnique({
        where: { balanceId: params.balanceId },
      });
      if (!agreement) {
        throw new Error(`Agreement não encontrado para balanceId ${params.balanceId}`);
      }
      targetAgreementId = agreement.id;
    }

    if (!targetAgreementId) {
      throw new Error("É necessário fornecer agreementId ou balanceId");
    }

    return this.prisma.agreementAmountEntry.create({
      data: {
        agreementId: targetAgreementId,
        amount: params.amount,
        effectiveAt: new Date(params.effectiveAt),
        reason: params.reason,
      },
    });
  }

  /**
   * Registra a provisão/geração da obrigação no ciclo (ACCRUAL):
   * Debita o COMMITMENT (-x) e Credita a CATEGORY (+x) na competanceDate do ciclo.
   */
  async addAccrual(params: {
    commitmentBalanceId: number;
    categoryBalanceId: number;
    description: string;
    amount: number;
    dueDate: string | Date;
    competanceDate?: string | Date;
  }) {
    const absAmount = Math.abs(params.amount);
    const due = new Date(params.dueDate);
    const comp = params.competanceDate ? new Date(params.competanceDate) : due;

    return this.prisma.entry.create({
      data: {
        description: params.description,
        type: EntryType.ACCRUAL,
        dueDate: due,
        competanceDate: comp,
        movements: {
          create: [
            {
              balanceId: params.commitmentBalanceId,
              amount: -absAmount,
              direction: MovementDirection.DEBIT,
            },
            {
              balanceId: params.categoryBalanceId,
              amount: absAmount,
              direction: MovementDirection.CREDIT,
            },
          ],
        },
      },
    });
  }

  /**
   * Liquida uma obrigação (SETTLEMENT):
   * Debita a Carteira (-x) na data real do pagamento (dueDate)
   * e Credita o COMMITMENT/CREDIT (+x) ancorado na competanceDate do ciclo.
   */
  async addSettlement(params: {
    walletBalanceId: number;
    commitmentBalanceId: number;
    description: string;
    amount: number;
    dueDate: string | Date;
    competanceDate?: string | Date;
  }) {
    const absAmount = Math.abs(params.amount);
    const due = new Date(params.dueDate);
    const comp = params.competanceDate ? new Date(params.competanceDate) : due;

    return this.prisma.entry.create({
      data: {
        description: params.description,
        type: EntryType.SETTLEMENT,
        dueDate: due,
        competanceDate: comp,
        movements: {
          create: [
            {
              balanceId: params.walletBalanceId,
              amount: -absAmount,
              direction: MovementDirection.DEBIT,
            },
            {
              balanceId: params.commitmentBalanceId,
              amount: absAmount,
              direction: MovementDirection.CREDIT,
            },
          ],
        },
      },
    });
  }

  async addCreditCard(params: CreditCardSeedInput) {
    const startDate = params.startsAt ? new Date(params.startsAt) : new Date(2026, 0, 1);
    const endDate = params.endsAt ? new Date(params.endsAt) : null;

    const rulesToCreate = [
      {
        closingDay: params.closingDay,
        dueDay: params.dueDay,
        frequency: CycleFrequency.MONTHLY,
        interval: 1,
        effectiveFrom: startDate,
      },
      ...(params.extraRules?.map((r) => ({
        closingDay: r.closingDay ?? params.closingDay,
        dueDay: r.dueDay,
        frequency: r.frequency ?? CycleFrequency.MONTHLY,
        interval: r.interval ?? 1,
        effectiveFrom: new Date(r.effectiveFrom),
      })) ?? []),
    ];

    const card = await this.prisma.balance.create({
      data: {
        contextId: this.contextId,
        name: params.name,
        balanceType: BalanceType.CREDIT,
        removedAt: params.isArchived ? new Date() : null,
        agreement: {
          create: {
            startsAt: startDate,
            endsAt: endDate,
            includeInProjection: true,
            rules: {
              create: rulesToCreate,
            },
            amountEntries: {
              create: params.limitEntries?.length
                ? params.limitEntries.map((e) => ({
                    amount: e.amount,
                    effectiveAt: new Date(e.effectiveAt),
                    reason: e.reason ?? "Ajuste de Limite",
                  }))
                : [
                    {
                      amount: params.limit,
                      effectiveAt: startDate,
                      reason: "Limite Inicial",
                    },
                  ],
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
          competanceDate: exp.competanceDate ?? exp.date,
          keepPositiveOnDebit: true,
        });
      }
    }

    return card;
  }

  async addCreditCards(items: CreditCardSeedInput[]) {
    const results = [];
    for (const item of items) {
      results.push(await this.addCreditCard(item));
    }
    return results;
  }

  async addDirectEntry(params: {
    balanceId: number;
    counterpartBalanceId?: number;
    description: string;
    amount: number;
    direction: MovementDirection;
    type?: EntryType;
    date?: string | Date;
    competanceDate?: string | Date;
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

    const due = params.date ? new Date(params.date) : new Date();
    const comp = params.competanceDate ? new Date(params.competanceDate) : due;

    return this.prisma.entry.create({
      data: {
        description: params.description,
        dueDate: due,
        competanceDate: comp,
        type: params.type ?? EntryType.DIRECT,
        movements: { create: movements },
      },
    });
  }

  async addSplitDirectEntry(params: {
    balanceId: number;
    splits: Array<{
      categoryId: number;
      amount: number;
    }>;
    description: string;
    direction: MovementDirection;
    type?: EntryType;
    date?: string | Date;
    competanceDate?: string | Date;
    keepPositiveOnDebit?: boolean;
  }) {
    const totalAbsAmount = params.splits.reduce((acc, s) => acc + Math.abs(s.amount), 0);
    const signedMainAmount =
      params.direction === MovementDirection.DEBIT && !params.keepPositiveOnDebit
        ? -totalAbsAmount
        : totalAbsAmount;

    const movements = [
      {
        balanceId: params.balanceId,
        amount: signedMainAmount,
        direction: params.direction,
      },
    ];

    const counterpartDirection =
      params.direction === MovementDirection.DEBIT
        ? MovementDirection.CREDIT
        : MovementDirection.DEBIT;

    for (const split of params.splits) {
      const splitAbs = Math.abs(split.amount);
      const splitSigned =
        counterpartDirection === MovementDirection.DEBIT ? -splitAbs : splitAbs;

      movements.push({
        balanceId: split.categoryId,
        amount: splitSigned,
        direction: counterpartDirection,
      });
    }

    const due = params.date ? new Date(params.date) : new Date();
    const comp = params.competanceDate ? new Date(params.competanceDate) : due;

    return this.prisma.entry.create({
      data: {
        description: params.description,
        dueDate: due,
        competanceDate: comp,
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
    const due = params.date ? new Date(params.date) : new Date();

    return this.prisma.entry.create({
      data: {
        description: params.description,
        dueDate: due,
        competanceDate: due,
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
    competanceDate?: string | Date;
  }) {
    const absAmount = Math.abs(params.amount);
    const reversalDirection =
      params.originalDirection === MovementDirection.DEBIT
        ? MovementDirection.CREDIT
        : MovementDirection.DEBIT;

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

    const due = params.date ? new Date(params.date) : new Date();
    const comp = params.competanceDate ? new Date(params.competanceDate) : due;

    return this.prisma.entry.create({
      data: {
        description: params.description,
        dueDate: due,
        competanceDate: comp,
        type: EntryType.REVERSAL,
        reversesEntryId: params.originalEntryId,
        movements: { create: movements },
      },
    });
  }
}