import type { LucideIcon } from "lucide-react";
import {
    CreditCard,
    Handshake,
    SlidersHorizontal,
    Tag,
    Wallet,
} from "lucide-react";
import {
    MovementEntryCounterpartKind,
    MovementEntryScope,
    MovementEntryDirection,
} from "@/modules/movements/models/movement-entry.schema";

export interface CounterpartKindTheme {
    label: string;
    icon: LucideIcon;
    avatarClassName: string;
    badgeClassName: string;
    /**
     * Resolve o prefixo do subtítulo conforme o escopo da tela e a direção do movimento.
     */
    resolveSubtitlePrefix?: (
        scope: MovementEntryScope,
        direction: MovementEntryDirection
    ) => string | null;
    /**
     * Informa se para este kind o subtítulo é navegável no escopo.
     */
    isNavigable?: (scope: MovementEntryScope) => boolean;
    /**
     * Gera o link relativo de navegação quando aplicável.
     */
    resolveHref?: (id: number, scope: MovementEntryScope) => string | null;
}

export const COUNTERPART_KIND_THEMES: Record<
    MovementEntryCounterpartKind,
    CounterpartKindTheme
> = {
    CATEGORY: {
        label: "Categoria",
        icon: Tag,
        avatarClassName: "bg-muted/70 text-muted-foreground",
        badgeClassName: "border-border text-muted-foreground bg-muted/40",
        resolveSubtitlePrefix: () => null,
        isNavigable: () => false,
    },
    CUSTODY: {
        label: "Custódia",
        icon: Wallet,
        avatarClassName: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        badgeClassName:
            "border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10",
        resolveSubtitlePrefix: (scope, direction) => {
            if (scope === "WALLET") {
                return direction === "DEBIT" ? "Para: " : "De: ";
            }
            return "Pago com ";
        },
        isNavigable: (scope) => scope !== "WALLET",
        resolveHref: (id) => `/wallets/${id}`,
    },
    CARD: {
        label: "Cartão de Crédito",
        icon: CreditCard,
        avatarClassName: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        badgeClassName:
            "border-purple-500/30 text-purple-700 dark:text-purple-400 bg-purple-500/10",
        resolveSubtitlePrefix: () => "Fatura: ",
        isNavigable: () => true,
        resolveHref: (id) => `/cards/${id}`,
    },
    CONTRACT: {
        label: "Contrato / Acordo",
        icon: Handshake,
        avatarClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        badgeClassName:
            "border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10",
        resolveSubtitlePrefix: (scope) => {
            if (scope === "CONTRACT_CYCLE") {
                return "Transferido para: ";
            }
            return "Contrato: ";
        },
        isNavigable: () => true,
        resolveHref: (id) => `/contracts/${id}`,
    },
    NONE: {
        label: "Sem contraparte",
        icon: SlidersHorizontal,
        avatarClassName: "bg-muted/70 text-muted-foreground",
        badgeClassName: "border-border text-muted-foreground bg-muted/40",
        resolveSubtitlePrefix: () => null,
        isNavigable: () => false,
    },
};
