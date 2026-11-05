import {
  BalanceType,
  CycleFrequency,
  EntryType,
  MovementDirection,
} from "../../generated/prisma/enums";
import type { PrismaClientInstance } from "./helpers";

export class ClaimSeedFactory {
  constructor(private readonly prisma: PrismaClientInstance) {}

  /**
   * Cria contas de cobrança bilaterais (RECEIVABLE no credor, PAYABLE no devedor).
   */
  async createClaimAccounts(params: {
    creditorContextId: number;
    debtorContextId: number;
    name: string;
    receivableParentId?: number | null;
    payableParentId?: number | null;
  }) {
    const receivable = await this.prisma.balance.create({
      data: {
        contextId: params.creditorContextId,
        name: `${params.name} (A Receber)`,
        balanceType: BalanceType.RECEIVABLE,
        parentId: params.receivableParentId ?? null,
      },
    });

    const payable = await this.prisma.balance.create({
      data: {
        contextId: params.debtorContextId,
        name: `${params.name} (A Pagar)`,
        balanceType: BalanceType.PAYABLE,
        parentId: params.payableParentId ?? null,
      },
    });

    return { receivable, payable };
  }

  /**
   * Passo I. Abertura Raiz (CLAIM_OPENING):
   * Debita P (-x), Credita R (+x).
   * Define parentId da CATEGORY no RECEIVABLE raiz. Sem pares de ligação nulos.
   */
  async openRootClaim(params: {
    payableId: number;
    receivableId: number;
    anchorCategoryId: number;
    amount: number;
    description: string;
    date: string | Date;
  }) {
    const abs = Math.abs(params.amount);
    const date = new Date(params.date);

    await this.prisma.balance.update({
      where: { id: params.receivableId },
      data: { parentId: params.anchorCategoryId },
    });

    await this.ensurePunctualAgreement(params.receivableId, abs, date);
    await this.ensurePunctualAgreement(params.payableId, abs, date);

    const movements = [
      {
        balanceId: params.payableId,
        amount: -abs,
        direction: MovementDirection.DEBIT,
      },
      {
        balanceId: params.receivableId,
        amount: abs,
        direction: MovementDirection.CREDIT,
      },
    ];

    return this.prisma.entry.create({
      data: {
        description: params.description,
        dueDate: date,
        competanceDate: date,
        type: EntryType.CLAIM_OPENING,
        movements: { create: movements },
      },
    });
  }

  /**
   * Passo I. Abertura Filho/Cascata (CLAIM_OPENING):
   * Debita P (-x), Credita R (+x).
   * Conecta childReceivable ao parentPayableId via parentId. Sem pares de ligação nulos.
   */
  async openChildClaim(params: {
    childPayableId: number;
    childReceivableId: number;
    parentPayableId: number;
    amount: number;
    description: string;
    date: string | Date;
  }) {
    const abs = Math.abs(params.amount);
    const date = new Date(params.date);

    await this.prisma.balance.update({
      where: { id: params.childReceivableId },
      data: { parentId: params.parentPayableId },
    });

    await this.ensurePunctualAgreement(params.childReceivableId, abs, date);
    await this.ensurePunctualAgreement(params.childPayableId, abs, date);

    const movements = [
      {
        balanceId: params.childPayableId,
        amount: -abs,
        direction: MovementDirection.DEBIT,
      },
      {
        balanceId: params.childReceivableId,
        amount: abs,
        direction: MovementDirection.CREDIT,
      },
    ];

    return this.prisma.entry.create({
      data: {
        description: params.description,
        dueDate: date,
        competanceDate: date,
        type: EntryType.CLAIM_OPENING,
        movements: { create: movements },
      },
    });
  }

  /**
   * Passo II. Aceite pelo Devedor:
   * 100% estrutural. Define o parentId do PAYABLE para a CATEGORY_D escolhida pelo devedor.
   */
  async acceptClaim(params: {
    payableId: number;
    categoryDId: number;
    amount?: number;
    description?: string;
    date?: string | Date;
  }) {
    return this.prisma.balance.update({
      where: { id: params.payableId },
      data: { parentId: params.categoryDId },
    });
  }

  /**
   * Passo III. Pagamento (CLAIM_PAYMENT):
   * Devedor retira de WALLET_D (-x) e credita PAYABLE (+x).
   */
  async payClaim(params: {
    walletDId: number;
    payableId: number;
    amount: number;
    description: string;
    date: string | Date;
  }) {
    const abs = Math.abs(params.amount);
    const date = new Date(params.date);

    const movements = [
      {
        balanceId: params.walletDId,
        amount: -abs,
        direction: MovementDirection.DEBIT,
      },
      {
        balanceId: params.payableId,
        amount: abs,
        direction: MovementDirection.CREDIT,
      },
    ];

    return this.prisma.entry.create({
      data: {
        description: params.description,
        dueDate: date,
        competanceDate: date,
        type: EntryType.CLAIM_PAYMENT,
        movements: { create: movements },
      },
    });
  }

  /**
   * Passo IV. Recebimento (CLAIM_RECEIPT):
   * Credor debita R (-x) e credita WALLET_C (+x).
   * Alívio orçamentário na categoria de origem (DEBIT -x) e oneração no destino (CREDIT +x).
   */
  async receiveClaim(params: {
    receivableId: number;
    walletCId: number;
    amount: number;
    description: string;
    date: string | Date;
    reliefCategory?: { categoryId: number; amount: number };
    onusCategory?: { categoryId: number; amount: number };
  }) {
    const abs = Math.abs(params.amount);
    const date = new Date(params.date);

    const movements: Array<{
      balanceId: number;
      amount: number;
      direction: MovementDirection;
    }> = [
      {
        balanceId: params.receivableId,
        amount: -abs,
        direction: MovementDirection.DEBIT,
      },
      {
        balanceId: params.walletCId,
        amount: abs,
        direction: MovementDirection.CREDIT,
      },
    ];

    if (params.reliefCategory) {
      const rAbs = Math.abs(params.reliefCategory.amount);
      movements.push({
        balanceId: params.reliefCategory.categoryId,
        amount: -rAbs,
        direction: MovementDirection.DEBIT,
      });
    }

    if (params.onusCategory) {
      const oAbs = Math.abs(params.onusCategory.amount);
      movements.push({
        balanceId: params.onusCategory.categoryId,
        amount: oAbs,
        direction: MovementDirection.CREDIT,
      });
    }

    return this.prisma.entry.create({
      data: {
        description: params.description,
        dueDate: date,
        competanceDate: date,
        type: EntryType.CLAIM_RECEIPT,
        movements: { create: movements },
      },
    });
  }

  private async ensurePunctualAgreement(balanceId: number, amount: number, date: Date) {
    const existing = await this.prisma.agreement.findUnique({
      where: { balanceId },
    });
    if (!existing) {
      const dueDay = date.getDate();
      await this.prisma.agreement.create({
        data: {
          balanceId,
          startsAt: date,
          endsAt: date,
          includeInProjection: true,
          rules: {
            create: {
              effectiveFrom: date,
              frequency: CycleFrequency.ONCE,
              interval: 1,
              dueDay,
              closingDay: null,
            },
          },
          amountEntries: {
            create: {
              amount,
              effectiveAt: date,
              reason: "Valor da Cobrança",
            },
          },
        },
      });
    }
  }
}
