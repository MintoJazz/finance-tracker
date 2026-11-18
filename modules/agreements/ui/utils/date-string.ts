/** Date local -> "YYYY-MM-DD" (sem passar por UTC, evita deslocar o dia). */
export function toDateString(date: Date | undefined | null): string | null {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" -> Date local ao meio-dia (evita virar o dia anterior em UTC-3). */
export function fromDateString(
    value: string | null | undefined
): Date | undefined {
    if (!value) return undefined;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return undefined;
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
}
