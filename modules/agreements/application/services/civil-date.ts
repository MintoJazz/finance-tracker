/**
 * Datas civis ("YYYY-MM-DD") sem fuso horário.
 *
 * - Colunas `@db.Date` chegam do Prisma como meia-noite UTC do dia civil.
 * - Colunas `DateTime` de vigência (`AgreementAmountEntry.effectiveAt`) usam o dia civil
 *   do servidor (meio-dia local nas datas escolhidas pelo usuário).
 * Misturar os dois sem converter desloca o dia em fusos negativos (ex.: UTC-3).
 */

const pad = (n: number) => String(n).padStart(2, "0");

/** Dia civil local (do servidor) de um instante. */
export function toCivilString(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Dia civil de uma coluna `@db.Date` (meia-noite UTC). */
export function utcDateToCivil(date: Date): string {
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function parseCivil(value: string): [number, number, number] {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) throw new Error(`Data inválida: ${value}`);
    return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Dia civil -> meia-noite UTC (para gravar em `@db.Date`). */
export function civilToUtcDate(value: string): Date {
    const [y, m, d] = parseCivil(value);
    return new Date(Date.UTC(y, m - 1, d));
}

/** Dia civil -> meio-dia local (para gravar em `DateTime` de vigência sem virar o dia). */
export function civilToLocalNoon(value: string): Date {
    const [y, m, d] = parseCivil(value);
    return new Date(y, m - 1, d, 12);
}

/** Dia civil -> meia-noite local (formato esperado pelo motor de ciclos, que usa `startOfDay`). */
export function civilToLocalMidnight(value: string): Date {
    const [y, m, d] = parseCivil(value);
    return new Date(y, m - 1, d);
}

export function addCivilDays(value: string, days: number): string {
    const [y, m, d] = parseCivil(value);
    return utcDateToCivil(new Date(Date.UTC(y, m - 1, d + days)));
}
