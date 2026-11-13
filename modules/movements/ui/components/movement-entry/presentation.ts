import {
    MovementEntry,
    MovementEntryScope,
} from "@/modules/movements/models/movement-entry.schema";
import { COUNTERPART_KIND_THEMES } from "../../themes/counterpart-kind";
import { MOVEMENT_ENTRY_TYPE_THEMES } from "../../themes/movement-entry-type";

export interface FormattedSubtitle {
    text: string;
    href: string | null;
}

/**
 * Resolve o subtítulo de apresentação baseado no kind da contraparte,
 * na direção do lançamento e no escopo atual da tela.
 */
export function resolveMovementEntrySubtitle(
    entry: MovementEntry,
    scope: MovementEntryScope
): FormattedSubtitle | null {
    const { counterpart, direction } = entry;
    if (counterpart.kind === "NONE" || !counterpart.name) {
        return null;
    }

    const theme = COUNTERPART_KIND_THEMES[counterpart.kind];
    const prefix = theme.resolveSubtitlePrefix
        ? theme.resolveSubtitlePrefix(scope, direction)
        : "";

    const text = `${prefix ?? ""}${counterpart.name}`;
    const isNavigable = theme.isNavigable ? theme.isNavigable(scope) : false;
    const href =
        isNavigable && counterpart.id && theme.resolveHref
            ? theme.resolveHref(counterpart.id, scope)
            : null;

    return { text, href };
}

/**
 * Resolve a semântica de valor para apresentação:
 * - Em Carteiras: crédito é receita (verde/positivo), débito é despesa/saída.
 * - Em Cartões e Ciclos (obrigações): crédito é quitação/estorno (reduz dívida, portanto verde com '-'), débito é compra/provisão.
 */
export function resolveMovementEntryAmountPresentation(
    entry: MovementEntry,
    scope: MovementEntryScope
): {
    isHighlightCredit: boolean;
    displayPrefix: string;
    colorClassName: string;
} {
    const { direction, type } = entry;

    if (scope === "WALLET") {
        const isIncome = direction === "CREDIT" && type !== "REVERSAL";
        return {
            isHighlightCredit: isIncome,
            displayPrefix: isIncome ? "+ " : "",
            colorClassName: isIncome
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-foreground",
        };
    }

    // Em Cartões e Ciclos de Contratos (passivos)
    const isDebtReduction =
        direction === "CREDIT" ||
        type === "SETTLEMENT" ||
        type === "REVERSAL";

    return {
        isHighlightCredit: isDebtReduction,
        displayPrefix: isDebtReduction ? "- " : "",
        colorClassName: isDebtReduction
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-foreground",
    };
}

/**
 * Resolve o label amigável do tipo de movimento para o escopo.
 */
export function resolveMovementEntryTypeLabel(
    entry: MovementEntry,
    scope: MovementEntryScope
): string {
    const theme = MOVEMENT_ENTRY_TYPE_THEMES[entry.type];
    return theme ? theme.resolveLabel(scope) : entry.type;
}

