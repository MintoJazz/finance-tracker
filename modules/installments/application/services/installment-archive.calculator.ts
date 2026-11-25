import { addMonths } from "date-fns";
import {
    civilToLocalNoon,
    toCivilString,
} from "@/modules/agreements/application/services/civil-date";

export interface InstallmentArchivePlanInput {
    totalInstallments: number;
    consolidatedInstallments: number;
    purchaseDate: string | null;
}

export interface InstallmentArchivePlan {
    /** Parcelas consolidadas preservadas integralmente no histórico. */
    keptCount: number;
    /** Parcelas em aberto que serão canceladas/neutralizadas. */
    cancelledCount: number;
    /** Nova data de término do contrato (última parcela consolidada, ou null se 0 consolidadas). */
    newEndsAt: string | null;
}

/** Resumo determinístico de arquivamento irreversível para confirmação na UI. */
export function planInstallmentArchive(
    input: InstallmentArchivePlanInput
): InstallmentArchivePlan {
    const keptCount = Math.max(0, Math.min(input.consolidatedInstallments, input.totalInstallments));
    const cancelledCount = Math.max(0, input.totalInstallments - keptCount);
    const newEndsAt =
        keptCount > 0 && input.purchaseDate
            ? toCivilString(addMonths(civilToLocalNoon(input.purchaseDate), keptCount - 1))
            : null;

    return {
        keptCount,
        cancelledCount,
        newEndsAt,
    };
}
