"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/formatters";
import type { AdjustInstallmentValuesValues } from "@/modules/installments/models/schemas/installment-values.schema";
import { adjustInstallmentValuesAction } from "@/modules/installments/ui/actions/adjust-installment-values.action";
import type {
    AdjustInstallmentValuesModalInput,
    AdjustInstallmentValuesModalProps,
} from "./types";

export function useAdjustInstallmentValuesModal(
    input: AdjustInstallmentValuesModalInput
): AdjustInstallmentValuesModalProps {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);
    const hasNavigatedRef = useRef(false);

    const navigateBack = useCallback(() => {
        if (!hasNavigatedRef.current) {
            hasNavigatedRef.current = true;
            router.back();
        }
    }, [router]);

    const onClose = useCallback(() => {
        setIsOpen(false);
        setTimeout(navigateBack, 300);
    }, [navigateBack]);

    const onOpenChangeComplete = useCallback(
        (open: boolean) => {
            if (!open) navigateBack();
        },
        [navigateBack]
    );

    const onSubmit = async (values: AdjustInstallmentValuesValues) => {
        const result = await adjustInstallmentValuesAction(
            input.installment.id,
            values
        );
        if (!result.success) {
            toast.add({
                type: "error",
                title: "Erro ao ajustar valores e parcelas",
                description: result.error,
                priority: "high",
            });
            return;
        }

        toast.add({
            type: "info",
            title: "Reconciliação validada (simulação)",
            description: `${result.data.totalInstallments}x • total ${formatMoney(result.data.totalAmount)}. Persistência no próximo ciclo de backend.`,
        });
        onClose();
    };

    return {
        isOpen,
        installment: input.installment,
        onSubmit,
        onClose,
        onOpenChangeComplete,
    };
}
