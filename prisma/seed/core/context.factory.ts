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
  balanceType?: BalanceType; // Default: PAYABLE (pode ser RECEIVABLE)
  /**
   * ID da subcategoria padrão (ou da obrigação pai, no caso de repasse).
   */
  categoryId: number;
  appearance?: {
    icon?: string | null;
    color?: string | null;
  };
  amount?: number;
  amountEntries?: Array<{
    amount: number;
    effectiveAt: string | Date;
    reason?: string;
  }>;
  startsAt: string | Date;
  endsAt?: string | Date | null;
  isActive?: boolean;
  isArchived?: boolean;
  rules: CycleRuleSeedInput[];
}

export interface CategoryTreeSeedInput {
  name: string;
  appearance?: { icon?: string | null; color?: string | null };
  subcategories: Array<{
    key: string;
    name: string;
    isArchived?: boolean;
    appearance?: { icon?: string | null; color?: string | null };
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
    const results = [];
    for (const item of items) {
      results.push(await this.addWallet(item));
    }
    return results;
  }

  async addCategory(
    name: string,
    options?:
      | {
          type?: BalanceType;
          parentId?: number | null;
          isArchived?: boolean;
          appearance?: {
            icon?: string | null;
            color?: string | null;
          };
        }
      | BalanceType
  ) {
    const balanceType =
      typeof options === "string" ? options : (options?.type ?? BalanceType.CATEGORY);
    const appearance =
      typeof options === "object" && options !== null ? options.appearance : undefined;
    const parentId =
      typeof options === "object" && options !== null ? (options.parentId ?? null) : null;
    const isArchived =
      typeof options === "object" && options !== null ? (options.isArchived ?? false) : false;

    return this.prisma.balance.create({
      data: {
        contextId: this.contextId,
        name,
        balanceType,
        parentId,
        removedAt: isArchived ? new Date("2026-08-31T23:59:59Z") : null,
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

  /**
   * Cria uma árvore de categorias de exatamente 2 níveis (Categoria Pai -> Subcategorias Folha).
   * Retorna tanto as raízes quanto um mapa tipado de subcategorias para vínculo em Entries e Agreements.
   */
  async addCategoryTree<TSubKey extends string>(
    groups: Array<{
      name: string;
      appearance?: { icon?: string | null; color?: string | null };
      subcategories: Array<{
        key: TSubKey;
        name: string;
        isArchived?: boolean;
        appearance?: { icon?: string | null; color?: string | null };
      }>;
    }>
  ) {
    const roots: Record<string, Awaited<ReturnType<typeof this.addCategory>>> = {};
    const sub: Record<TSubKey, Awaited<ReturnType<typeof this.addCategory>>> = {} as Record<
      TSubKey,
      Awaited<ReturnType<typeof this.addCategory>>
    >;

    for (const group of groups) {
      const root = await this.addCategory(group.name, {
        parentId: null,
        appearance: group.appearance,
      });
      roots[group.name] = root;

      for (const item of group.subcategories) {
        const child = await this.addCategory(item.name, {
          parentId: root.id,
          isArchived: item.isArchived,
          appearance:
            item.appearance !== undefined ? item.appearance : group.appearance,
        });
        sub[item.key] = child;
      }
    }

    return { roots, sub };
  }

  /**
   * Árvore padrão de 2 níveis para contextos de outros usuários e grupos.
   */
  async addDefaultCategoryTree() {
    return this.addCategoryTree([
      {
        name: "Renda & Entradas",
        appearance: { icon: "wallet", color: "emerald" },
        subcategories: [
          { key: "salario", name: "Salário CLT" },
          { key: "freelance", name: "Freelance & Projetos" },
          { key: "rendimentos", name: "Dividendos & Rendimentos" },
        ],
      },
      {
        name: "Moradia & Contas",
        appearance: { icon: "house", color: "sky" },
        subcategories: [
          { key: "aluguel", name: "Aluguel" },
          { key: "condominio", name: "Condomínio" },
          { key: "energiaAgua", name: "Energia & Água" },
          { key: "internet", name: "Internet & TV" },
        ],
      },
      {
        name: "Alimentação & Mercado",
        appearance: { icon: "utensils", color: "orange" },
        subcategories: [
          { key: "supermercado", name: "Supermercado & Feira" },
          { key: "restaurantes", name: "Restaurantes & Bares" },
          { key: "delivery", name: "Delivery & Cafés" },
        ],
      },
      {
        name: "Transporte & Combustível",
        appearance: { icon: "car", color: "amber" },
        subcategories: [
          { key: "combustivel", name: "Combustível" },
          { key: "appsTransporte", name: "Uber & Transporte Urbano" },
          { key: "pedagioEstacionamento", name: "Estacionamento & Pedágio" },
          { key: "impostosAuto", name: "IPVA & Seguro Auto" },
        ],
      },
      {
        name: "Lazer & Estilo de Vida",
        appearance: { icon: "party-popper", color: "violet" },
        subcategories: [
          { key: "showsEventos", name: "Shows, Cinema & Eventos" },
          { key: "viagens", name: "Hospedagem & Viagens" },
          { key: "hobbies", name: "Compras, Livros & Hobbies" },
        ],
      },
      {
        name: "Saúde & Bem-Estar",
        appearance: { icon: "heart-pulse", color: "rose" },
        subcategories: [
          { key: "farmacia", name: "Farmácia & Medicamentos" },
          { key: "planoSaude", name: "Plano de Saúde & Consultas" },
          { key: "academia", name: "Academia & Esportes" },
        ],
      },
      {
        name: "Assinaturas & Serviços",
        appearance: { icon: "tv", color: "indigo" },
        subcategories: [
          { key: "streaming", name: "Streaming de Vídeo & Música" },
          { key: "softwares", name: "Apps, Nuvem & Clubes" },
        ],
      },
    ]);
  }

  /**
   * Cria um Balance (PAYABLE ou RECEIVABLE) acoplado a um Agreement e múltiplas CycleRules.
   * Fora os repasses, o parentId deve sempre apontar para uma subcategoria padrão.
   */
  async addCommitmentAgreement(params: CommitmentAgreementSeedInput) {
    const startDate = new Date(params.startsAt);
    const endDate = params.endsAt ? new Date(params.endsAt) : null;

    return this.prisma.balance.create({
      data: {
        contextId: this.contextId,
        name: params.name,
        balanceType: params.balanceType ?? BalanceType.PAYABLE,
        parentId: params.categoryId,
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
            isActive: params.isActive ?? true,
            frequency: params.rules[0]?.frequency ?? CycleFrequency.MONTHLY,
            interval: params.rules[0]?.interval ?? 1,
            rules: {
              create: params.rules.map((r) => ({
                effectiveFrom: new Date(r.effectiveFrom),
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
    const targetAgreementId = params.balanceId ?? params.agreementId;
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
   * Debita o PAYABLE (-x) e Credita a SUBCATEGORIA (+x) na competanceDate do ciclo.
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
   * e Credita o PAYABLE/CREDIT (+x) ancorado na competanceDate do ciclo.
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
        effectiveFrom: startDate,
      },
      ...(params.extraRules?.map((r) => ({
        closingDay: r.closingDay ?? params.closingDay,
        dueDay: r.dueDay,
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
            isActive: true,
            frequency: params.extraRules?.[0]?.frequency ?? CycleFrequency.MONTHLY,
            interval: params.extraRules?.[0]?.interval ?? 1,
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
  }) {
    const absAmount = Math.abs(params.amount);
    const signedAmount =
      params.direction === MovementDirection.DEBIT ? -absAmount : absAmount;

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
  }) {
    const totalAbsAmount = params.splits.reduce((acc, s) => acc + Math.abs(s.amount), 0);
    const signedMainAmount =
      params.direction === MovementDirection.DEBIT ? -totalAbsAmount : totalAbsAmount;

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