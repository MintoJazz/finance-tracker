import {
  BalanceType,
  EntryType,
  MovementDirection,
} from "../../generated/prisma/enums";
import type { PrismaClientInstance } from "./helpers";

export class ClaimSeedFactory {
  constructor(private readonly prisma: PrismaClientInstance) {}

  /**
   * Helper para gravar um Par de Ligação (±x) com efeito contábil líquido zero.
   * Convenção: +x CREDIT e -x DEBIT (sinais opostos).
   */
  private createLinkPairMovements(balanceId: number, amount: number) {
    const abs = Math.abs(amount);
    return [
      {
        balanceId,
        amount: abs,
        direction: MovementDirection.CREDIT,
      },
      {
        balanceId,
        amount: -abs,
        direction: MovementDirection.DEBIT,
      },
    ];
  }

  /**
   * Cria contas de cobrança bilaterais (RECEIVABLE no credor, PAYABLE no devedor).
   */
  async createClaimAccounts(params: {
    creditorContextId: number;
    debtorContextId: number;
    name: string;
  }) {
    const receivable = await this.prisma.balance.create({
      data: {
        contextId: params.creditorContextId,
        name: `${params.name} (A Receber)`,
        balanceType: BalanceType.RECEIVABLE,
      },
    });

    const payable = await this.prisma.balance.create({
      data: {
        contextId: params.debtorContextId,
        name: `${params.name} (A Pagar)`,
        balanceType: BalanceType.PAYABLE,
      },
    });

    return { receivable, payable };
  }

  /**
   * Passo I. Abertura Raiz (CLAIM_OPENING):
   * Debita P (-x), Credita R (+x).
   * Injeta par ±x na CATEGORY do Credor (âncora).
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
      ...this.createLinkPairMovements(params.anchorCategoryId, abs),
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
   * Injeta par ±x no PAYABLE da cobrança pai (pertencente ao intermediário).
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
      ...this.createLinkPairMovements(params.parentPayableId, abs),
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
   * Passo II. Aceite (CLAIM_ACCEPTANCE):
   * Sem fluxo financeiro.
   * Injeta par ±x no PAYABLE atual e outro par ±x na CATEGORY_D do Devedor.
   */
  async acceptClaim(params: {
    payableId: number;
    categoryDId: number;
    amount: number;
    description: string;
    date: string | Date;
  }) {
    const abs = Math.abs(params.amount);
    const date = new Date(params.date);

    const movements = [
      ...this.createLinkPairMovements(params.payableId, abs),
      ...this.createLinkPairMovements(params.categoryDId, abs),
    ];

    return this.prisma.entry.create({
      data: {
        description: params.description,
        dueDate: date,
        competanceDate: date,
        type: EntryType.CLAIM_ACCEPTANCE,
        movements: { create: movements },
      },
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
   * No intermediário, se houver passagem, injeta um par ±x na categoria do intermediário.
   */
  async receiveClaim(params: {
    receivableId: number;
    walletCId: number;
    amount: number;
    description: string;
    date: string | Date;
    reliefCategory?: { categoryId: number; amount: number };
    onusCategory?: { categoryId: number; amount: number };
    passThroughCategory?: { categoryId: number; amount: number };
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

    if (params.passThroughCategory) {
      movements.push(
        ...this.createLinkPairMovements(
          params.passThroughCategory.categoryId,
          params.passThroughCategory.amount
        )
      );
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
}
