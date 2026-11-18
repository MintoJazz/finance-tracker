import { toCivilString, utcDateToCivil } from "../services/civil-date";

export type AdjustmentScope = "CARD" | "RECURRENCE";

export class AgreementAdjustmentDomainError extends Error {
    constructor(
        message: string,
        public readonly code: string
    ) {
        super(message);
        this.name = "AgreementAdjustmentDomainError";
    }
}

/** Visão mínima do acordo que a política precisa para validar um ajuste. */
export interface AdjustableAgreement {
    removedAt: Date | null;
    endsAt: Date | null;
}

export interface DeadlinesInput {
    dueDay: number;
    dueMonth?: number | null;
    closingDay?: number | null;
    closingMonth?: number | null;
    /** Cartão ignora: o fechamento é sempre obrigatório. */
    hasCustomClosingDate?: boolean;
}

export interface NormalizedDeadlines {
    dueDay: number;
    dueMonth: number | null;
    closingDay: number | null;
    closingMonth: number | null;
}

const SCOPE_LABELS: Record<AdjustmentScope, { singular: string; manage: string }> = {
    CARD: { singular: "cartão", manage: "os cartões" },
    RECURRENCE: { singular: "recorrência", manage: "as recorrências" },
};

const inRange = (value: number | null | undefined, min: number, max: number) =>
    typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;

export class AgreementAdjustmentPolicy {
    static notFoundMessage(scope: AdjustmentScope): string {
        return scope === "CARD" ? "Cartão não encontrado." : "Recorrência não encontrada.";
    }

    static noPermissionMessage(scope: AdjustmentScope): string {
        return `Sem permissão para gerenciar ${SCOPE_LABELS[scope].manage} deste contexto!`;
    }

    /** Cartão arquivado e recorrência encerrada/arquivada não aceitam novos ajustes. */
    static assertAdjustable(
        scope: AdjustmentScope,
        agreement: AdjustableAgreement,
        today: Date
    ): void {
        if (agreement.removedAt !== null) {
            throw new AgreementAdjustmentDomainError(
                scope === "CARD"
                    ? "Não é possível ajustar um cartão arquivado."
                    : "Não é possível ajustar uma recorrência arquivada.",
                "ARCHIVED"
            );
        }
        if (
            scope === "RECURRENCE" &&
            agreement.endsAt !== null &&
            utcDateToCivil(agreement.endsAt) < toCivilString(today)
        ) {
            throw new AgreementAdjustmentDomainError(
                "Não é possível ajustar uma recorrência encerrada.",
                "ENDED"
            );
        }
    }

    static assertValidAmount(amount: number): void {
        if (!Number.isInteger(amount) || amount < 0) {
            throw new AgreementAdjustmentDomainError(
                "Informe um valor válido, em centavos e não negativo.",
                "INVALID_AMOUNT"
            );
        }
    }

    /**
     * Valida e normaliza os prazos conforme a frequência DO ACORDO (nunca a do payload):
     * - MONTHLY: dias 1–31; sem meses
     * - WEEKLY: dias da semana 0–6; sem meses
     * - YEARLY: dia 1–31 + mês 1–12
     * Cartão sempre exige fechamento; recorrência só com `hasCustomClosingDate`.
     */
    static normalizeDeadlines(
        scope: AdjustmentScope,
        frequency: string,
        input: DeadlinesInput
    ): NormalizedDeadlines {
        const fail = (message: string): never => {
            throw new AgreementAdjustmentDomainError(message, "INVALID_DEADLINES");
        };

        const hasClosing =
            scope === "CARD" ? true : Boolean(input.hasCustomClosingDate);

        switch (frequency) {
            case "MONTHLY": {
                if (!inRange(input.dueDay, 1, 31))
                    fail("O dia de vencimento deve ser entre 1 e 31.");
                if (hasClosing && !inRange(input.closingDay, 1, 31))
                    fail("O dia de fechamento deve ser entre 1 e 31.");
                return {
                    dueDay: input.dueDay,
                    dueMonth: null,
                    closingDay: hasClosing ? (input.closingDay as number) : null,
                    closingMonth: null,
                };
            }
            case "WEEKLY": {
                if (!inRange(input.dueDay, 0, 6))
                    fail("Selecione o dia da semana do vencimento.");
                if (hasClosing && !inRange(input.closingDay, 0, 6))
                    fail("Selecione o dia da semana do fechamento.");
                return {
                    dueDay: input.dueDay,
                    dueMonth: null,
                    closingDay: hasClosing ? (input.closingDay as number) : null,
                    closingMonth: null,
                };
            }
            case "YEARLY": {
                if (!inRange(input.dueDay, 1, 31) || !inRange(input.dueMonth, 1, 12))
                    fail("Informe o dia e o mês de vencimento.");
                if (
                    hasClosing &&
                    (!inRange(input.closingDay, 1, 31) || !inRange(input.closingMonth, 1, 12))
                )
                    fail("Informe o dia e o mês de fechamento.");
                return {
                    dueDay: input.dueDay,
                    dueMonth: input.dueMonth as number,
                    closingDay: hasClosing ? (input.closingDay as number) : null,
                    closingMonth: hasClosing ? (input.closingMonth as number) : null,
                };
            }
            default:
                return fail("A frequência deste acordo não permite ajuste de prazos.");
        }
    }
}
