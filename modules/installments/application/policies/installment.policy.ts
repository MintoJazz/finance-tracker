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
}
