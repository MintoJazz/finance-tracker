import { addMonths } from "date-fns";
import {
    civilToLocalNoon,
    toCivilString,
} from "@/modules/agreements/application/services/civil-date";
import type { InstallmentValuesEditMode } from "../../models/schemas/installment-values.schema";
import { InstallmentPolicy } from "../policies/installment.policy";
import { splitInstallmentAmounts } from "./installment-schedule.calculator";

export interface InstallmentValuesReconciliationInput {
    totalInstallments: number;
    consolidatedInstallments: number;
    /** Soma real das parcelas consolidadas (imutáveis), em centavos. */
    consolidatedAmount: number;
    /** Data de término atual (YYYY-MM-DD), usada para projetar a nova data final na cadência mensal vigente. */
    endsAt: string | null;
    newTotalInstallments: number;
    editMode: InstallmentValuesEditMode;
    /** Valor da parcela (quando INSTALLMENT_AMOUNT) ou valor total desejado (quando TOTAL_AMOUNT), em centavos. */
    targetAmount: number;
}

export interface InstallmentValuesReconciliationPlan {
    consolidatedCount: number;
    currentOpenCount: number;
    targetOpenCount: number;
    keptOpenCount: number;
    addedCount: number;
    cancelledCount: number;
    /** Valor base (centavos) de cada parcela em aberto 1..K-1 (0 se targetOpenCount === 0). */
    baseOpenAmount: number;
    /** Valor (centavos) da última parcela em aberto (absorve a dízima, quando houver). */
    lastOpenAmount: number;
    /** True quando a última parcela em aberto difere das demais por resto de divisão em centavos. */
    hasRemainder: boolean;
    /** Soma das parcelas em aberto após a reconciliação (centavos). */
    remainingTotalAmount: number;
    /** Valor total resultante (consolidatedAmount + remainingTotalAmount), em centavos. */
    newTotalAmount: number;
    /** Nova data final (YYYY-MM-DD) seguindo a cadência mensal vigente, sem alterar datas das parcelas mantidas. */
    newEndsAt: string | null;
}

/**
 * Calcula o plano e o resumo de preview da ação unificada **Valores e Parcelas**
 * sobre a cauda em aberto, preservando intactas as parcelas consolidadas e as datas
 * das parcelas mantidas.
 */
export function planInstallmentValuesReconciliation(
    input: InstallmentValuesReconciliationInput
): InstallmentValuesReconciliationPlan {
    const {
        totalInstallments,
        consolidatedInstallments,
        consolidatedAmount,
        endsAt,
        newTotalInstallments,
        editMode,
        targetAmount,
    } = input;

    InstallmentPolicy.assertHasOpenParcels(
        consolidatedInstallments,
        totalInstallments
    );

    const currentOpenCount = Math.max(0, totalInstallments - consolidatedInstallments);
    const targetOpenCount = newTotalInstallments - consolidatedInstallments;

    const remainingTotalAmount =
        targetOpenCount === 0
            ? 0
            : editMode === "INSTALLMENT_AMOUNT"
              ? targetOpenCount * targetAmount
              : targetAmount - consolidatedAmount;

    InstallmentPolicy.assertValidValuesReconciliation({
        consolidatedInstallments,
        newTotalInstallments,
        remainingTotalAmount,
    });

    let baseOpenAmount = 0;
    let lastOpenAmount = 0;
    if (targetOpenCount > 0) {
        if (editMode === "INSTALLMENT_AMOUNT") {
            baseOpenAmount = targetAmount;
            lastOpenAmount = targetAmount;
        } else {
            const split = splitInstallmentAmounts(remainingTotalAmount, targetOpenCount);
            baseOpenAmount = split[0];
            lastOpenAmount = split[split.length - 1];
        }
    }

    const deltaOpen = targetOpenCount - currentOpenCount;
    const addedCount = Math.max(0, deltaOpen);
    const cancelledCount = Math.max(0, -deltaOpen);
    const keptOpenCount = Math.min(currentOpenCount, targetOpenCount);

    const newEndsAt =
        endsAt != null
            ? toCivilString(addMonths(civilToLocalNoon(endsAt), deltaOpen))
            : null;

    return {
        consolidatedCount: consolidatedInstallments,
        currentOpenCount,
        targetOpenCount,
        keptOpenCount,
        addedCount,
        cancelledCount,
        baseOpenAmount,
        lastOpenAmount,
        hasRemainder: targetOpenCount > 1 && lastOpenAmount !== baseOpenAmount,
        remainingTotalAmount,
        newTotalAmount: consolidatedAmount + remainingTotalAmount,
        newEndsAt,
    };
}
