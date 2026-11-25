import {
    MAX_INSTALLMENTS,
    MIN_INSTALLMENTS,
} from "../../models/schemas/installment-form.schema";
import type { InstallmentType } from "../../models/schemas/installment-item.schema";

export class InstallmentDomainError extends Error {
    constructor(
        message: string,
        public readonly code: string
    ) {
        super(message);
        this.name = "InstallmentDomainError";
    }
}

export interface InstallmentCardRecord {
    id: number;
    balanceType: string;
    isArchived: boolean;
}

export interface InstallmentValuesReconciliationValidationInput {
    consolidatedInstallments: number;
    newTotalInstallments: number;
    /** Valor restante a distribuir nas parcelas em aberto (centavos). Obrigatório quando houver parcelas em aberto. */
    remainingTotalAmount: number;
}

export class InstallmentPolicy {
    /** Cartão da fatura: precisa existir no contexto, ser de crédito e estar ativo. */
    static validateCard(card: InstallmentCardRecord | null): InstallmentCardRecord {
        if (!card) {
            throw new InstallmentDomainError("Cartão não encontrado.", "CARD_NOT_FOUND");
        }
        if (card.balanceType !== "CREDIT") {
            throw new InstallmentDomainError(
                "O balance informado não é um cartão de crédito.",
                "CARD_INVALID_TYPE"
            );
        }
        if (card.isArchived) {
            throw new InstallmentDomainError(
                "O cartão selecionado está arquivado.",
                "CARD_ARCHIVED"
            );
        }
        return card;
    }

    /** Parcelamentos arquivados são somente leitura (irreversíveis). */
    static assertNotArchived(isArchived: boolean): void {
        if (isArchived) {
            throw new InstallmentDomainError(
                "Parcelamentos arquivados são somente leitura e não podem ser alterados.",
                "INSTALLMENT_ARCHIVED"
            );
        }
    }

    /** Mutações financeiras exigem ao menos uma parcela em aberto (fora da fronteira consolidada). */
    static assertHasOpenParcels(
        consolidatedInstallments: number,
        totalInstallments: number
    ): void {
        if (totalInstallments - consolidatedInstallments <= 0) {
            throw new InstallmentDomainError(
                "Todas as parcelas já estão consolidadas e não podem mais ser alteradas.",
                "INSTALLMENT_FULLY_CONSOLIDATED"
            );
        }
    }

    /** Ajuste de dia de vencimento é exclusivo de parcelamentos Mês a Mês. */
    static assertCanAdjustDueDay(type: InstallmentType): void {
        if (type !== "MONTHLY") {
            throw new InstallmentDomainError(
                "O dia de vencimento só pode ser alterado em parcelamentos mês a mês.",
                "INVALID_TYPE_FOR_DUE_DAY"
            );
        }
    }

    /** Troca de cartão é exclusiva de parcelamentos Em Fatura. */
    static assertCanChangeCard(type: InstallmentType): void {
        if (type !== "INVOICE") {
            throw new InstallmentDomainError(
                "A troca de cartão só está disponível para parcelamentos em fatura.",
                "INVALID_TYPE_FOR_CARD_CHANGE"
            );
        }
    }

    /** Regras de fronteira da reconciliação de Valores e Parcelas. */
    static assertValidValuesReconciliation({
        consolidatedInstallments,
        newTotalInstallments,
        remainingTotalAmount,
    }: InstallmentValuesReconciliationValidationInput): void {
        if (!Number.isInteger(newTotalInstallments)) {
            throw new InstallmentDomainError(
                "A quantidade de parcelas deve ser um número inteiro.",
                "INVALID_COUNT"
            );
        }
        if (newTotalInstallments < consolidatedInstallments) {
            throw new InstallmentDomainError(
                `Não é possível reduzir para menos que ${consolidatedInstallments} parcelas já consolidadas.`,
                "TOTAL_BELOW_CONSOLIDATED"
            );
        }
        if (
            consolidatedInstallments === 0 &&
            newTotalInstallments < MIN_INSTALLMENTS
        ) {
            throw new InstallmentDomainError(
                `O parcelamento deve ter no mínimo ${MIN_INSTALLMENTS} parcelas.`,
                "MIN_INSTALLMENTS_REQUIRED"
            );
        }
        if (newTotalInstallments > MAX_INSTALLMENTS) {
            throw new InstallmentDomainError(
                `O parcelamento pode ter no máximo ${MAX_INSTALLMENTS} parcelas.`,
                "MAX_INSTALLMENTS_EXCEEDED"
            );
        }

        const targetOpenCount = newTotalInstallments - consolidatedInstallments;
        if (
            targetOpenCount > 0 &&
            (!Number.isInteger(remainingTotalAmount) || remainingTotalAmount <= 0)
        ) {
            throw new InstallmentDomainError(
                "O valor restante para as parcelas em aberto deve ser maior que zero.",
                "INVALID_REMAINING_AMOUNT"
            );
        }
    }
}
