"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import type { UpdateInstallmentNameValues } from "@/modules/installments/models/schemas/installment-edit.schema";
import { updateInstallmentNameAction } from "@/modules/installments/ui/actions/update-installment-name.action";
import type {
    EditInstallmentModalInput,
    EditInstallmentModalProps,
} from "./types";

export function useEditInstallmentModal(
    input: EditInstallmentModalInput
): EditInstallmentModalProps {
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

    const onSubmit = async (values: UpdateInstallmentNameValues) => {
        const result = await updateInstallmentNameAction(
            input.installment.id,
            values
        );
        if (!result.success) {
            toast.add({
                type: "error",
                title: "Erro ao editar nome",
                description: result.error,
                priority: "high",
            });
            return;
        }

        toast.add({
            type: "info",
            title: "Nome validado (simulação)",
            description: `"${result.data.name}" pronto para persistência no próximo ciclo de backend.`,
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
