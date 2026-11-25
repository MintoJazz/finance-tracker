"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import type { AdjustMonthlyDueDayValues } from "@/modules/installments/models/schemas/installment-deadlines.schema";
import { adjustInstallmentDeadlinesAction } from "@/modules/installments/ui/actions/adjust-installment-deadlines.action";
import type {
    AdjustInstallmentDeadlinesModalInput,
    AdjustInstallmentDeadlinesModalProps,
} from "./types";

export function useAdjustInstallmentDeadlinesModal(
    input: AdjustInstallmentDeadlinesModalInput
): AdjustInstallmentDeadlinesModalProps {
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

    const onSubmit = async (values: AdjustMonthlyDueDayValues) => {
        const result = await adjustInstallmentDeadlinesAction(
            input.installment.id,
            { dueDay: values.dueDay }
        );
        if (!result.success) {
            toast.add({
                type: "error",
                title: "Erro ao ajustar vencimento",
                description: result.error,
                priority: "high",
            });
            return;
        }

        toast.add({
            type: "info",
            title: "Dia de vencimento validado (simulação)",
            description: `Novo vencimento todo dia ${values.dueDay} para as parcelas em aberto. Persistência no próximo ciclo de backend.`,
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
