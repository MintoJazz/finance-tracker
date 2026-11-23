import { addMonths } from "date-fns";
import {
    civilToLocalNoon,
    toCivilString,
} from "@/modules/agreements/application/services/civil-date";
import { InstallmentDomainError } from "../policies/installment.policy";

export interface InstallmentScheduleItem {
    /** Posição da parcela (1..N). */
    number: number;
    /** Data civil da parcela (YYYY-MM-DD): compra/vencimento da 1ª, depois mês a mês. */
    date: string;
    /** Valor da parcela, em centavos. */
    amount: number;
}

/**
 * Divide o total em `count` parcelas inteiras: as N-1 primeiras valem `floor(total / count)`
 * e a última absorve o resto, de modo que a soma é sempre exatamente o total.
 */
export function splitInstallmentAmounts(total: number, count: number): number[] {
    if (!Number.isInteger(total) || total <= 0) {
        throw new InstallmentDomainError(
            "O valor total deve ser um inteiro positivo, em centavos.",
            "INVALID_TOTAL"
        );
    }
    if (!Number.isInteger(count) || count < 1) {
        throw new InstallmentDomainError(
            "O número de parcelas deve ser um inteiro positivo.",
            "INVALID_COUNT"
        );
    }

    const base = Math.floor(total / count);
    const amounts = Array<number>(count).fill(base);
    amounts[count - 1] = total - base * (count - 1);
    return amounts;
}

/**
 * Cronograma mensal a partir da 1ª data. Cada data é calculada a partir da primeira
 * (não da anterior), então o dia é limitado ao fim do mês sem acumular deslocamento
 * (31/jan, 28/fev, 31/mar).
 */
export function buildInstallmentSchedule(params: {
    firstDate: string;
    total: number;
    count: number;
}): InstallmentScheduleItem[] {
    const first = civilToLocalNoon(params.firstDate);
    return splitInstallmentAmounts(params.total, params.count).map((amount, index) => ({
        number: index + 1,
        date: toCivilString(addMonths(first, index)),
        amount,
    }));
}
