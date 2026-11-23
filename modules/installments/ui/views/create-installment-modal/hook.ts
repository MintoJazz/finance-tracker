"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import type { InstallmentFormValues } from "@/modules/installments/models/schemas/installment-form.schema";
import { createInstallmentAction } from "@/modules/installments/ui/actions/create-installment.action";
import { getInstallmentFormDefaults } from "@/modules/installments/ui/utils/installment-form.utils";
import type {
    CreateInstallmentModalInput,
    CreateInstallmentModalProps,
} from "./types";

export function useCreateInstallmentModal(
    input: CreateInstallmentModalInput
): CreateInstallmentModalProps {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);
    const hasNavigatedRef = useRef(false);

    const defaultValues = input.defaultValues;
    const initialData = useMemo(
        () => getInstallmentFormDefaults(defaultValues),
        [defaultValues]
    );

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

    // O Wizard controla o estado de envio (botão "Processando...") enquanto esta promise roda
    const onSubmit = async (data: InstallmentFormValues) => {
        try {
            const result = await createInstallmentAction(data);

            if (!result.success) {
                toast.add({
                    type: "error",
                    title: "Erro ao criar parcelamento",
                    description: result.error ?? "Não foi possível criar o parcelamento.",
                    priority: "high",
                });
                return;
            }

            toast.add({
                type: "success",
                title: "Parcelamento criado",
                description: `O parcelamento "${data.name}" foi criado com sucesso.`,
            });
            onClose();
        } catch (error) {
            console.error("[useCreateInstallmentModal] Falha ao criar parcelamento:", error);
            toast.add({
                type: "error",
                title: "Erro inesperado",
                description: "Ocorreu um erro interno. Tente novamente mais tarde.",
                priority: "high",
            });
        }
    };

    return {
        isOpen,
        options: input.options,
        initialData,
        onSubmit,
        onClose,
        onOpenChangeComplete,
    };
}
