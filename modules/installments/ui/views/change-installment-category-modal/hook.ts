"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import type { ChangeInstallmentCategoryValues } from "@/modules/installments/models/schemas/installment-category.schema";
import { changeInstallmentCategoryAction } from "@/modules/installments/ui/actions/change-installment-category.action";
import type {
    ChangeInstallmentCategoryModalInput,
    ChangeInstallmentCategoryModalProps,
} from "./types";

export function useChangeInstallmentCategoryModal(
    input: ChangeInstallmentCategoryModalInput
): ChangeInstallmentCategoryModalProps {
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

    const onSubmit = async (values: ChangeInstallmentCategoryValues) => {
        const result = await changeInstallmentCategoryAction(
            input.installment.id,
            values
        );
        if (!result.success) {
            toast.add({
                type: "error",
                title: "Erro ao trocar categoria",
                description: result.error,
                priority: "high",
            });
            return;
        }

        const scopeLabel =
            result.data.scope === "ALL"
                ? "todo o parcelamento"
                : "parcelas em aberto";
        toast.add({
            type: "info",
            title: "Troca de categoria validada (simulação)",
            description: `Escopo selecionado: ${scopeLabel}. Persistência no próximo ciclo de backend.`,
        });
        onClose();
    };

    return {
        isOpen,
        installment: input.installment,
        options: input.options,
        onSubmit,
        onClose,
        onOpenChangeComplete,
    };
}
