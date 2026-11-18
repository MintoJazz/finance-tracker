import { toCivilString, utcDateToCivil } from "./civil-date";

export interface LedgerEntry {
    amount: number;
    effectiveAt: Date;
}

export interface EffectiveRule {
    effectiveFrom: Date;
}

/**
 * `AgreementAmountEntry` é um livro de deltas: o valor/limite numa data é a soma
 * das linhas cuja vigência já começou nela. Linhas futuras ainda não contam.
 */
export function sumEffectiveAmount(
    entries: LedgerEntry[],
    at: Date = new Date()
): number {
    const ref = toCivilString(at);
    const sum = entries
        .filter((entry) => toCivilString(entry.effectiveAt) <= ref)
        .reduce((acc, entry) => acc + entry.amount, 0);
    return Math.max(0, sum);
}

/** Existe alguma linha com vigência posterior ao dia informado? */
export function hasEntriesAfter(entries: LedgerEntry[], at: Date): boolean {
    const ref = toCivilString(at);
    return entries.some((entry) => toCivilString(entry.effectiveAt) > ref);
}

/** Delta necessário para que o valor vigente em `at` passe a ser `target`. */
export function toAmountDelta(
    target: number,
    entries: LedgerEntry[],
    at: Date
): number {
    return target - sumEffectiveAmount(entries, at);
}

/**
 * Regra de ciclo vigente no dia: a de maior `effectiveFrom` que já começou.
 * Se todas forem futuras, usa a mais antiga (mesmo fallback da recorrência).
 */
export function resolveEffectiveRule<T extends EffectiveRule>(
    rules: T[],
    today: Date = new Date()
): T | undefined {
    if (rules.length === 0) return undefined;

    const ref = toCivilString(today);
    const sorted = [...rules].sort(
        (a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime()
    );
    return (
        sorted.find((rule) => utcDateToCivil(rule.effectiveFrom) <= ref) ??
        sorted[sorted.length - 1]
    );
}
