"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import type { RecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import { createRecurrenceAction } from "@/modules/recurrences/ui/actions/create-recurrence.action";
import { getRecurrenceFormDefaults } from "@/modules/recurrences/ui/utils/recurrence-form.utils";
import type {
    CreateRecurrenceModalInput,
    CreateRecurrenceModalProps,
} from "./types";

export function useCreateRecurrenceModal(
    input: CreateRecurrenceModalInput
): CreateRecurrenceModalProps {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);
    const hasNavigatedRef = useRef(false);

    const defaultValues = input.defaultValues;
    const initialData = useMemo(
        () => getRecurrenceFormDefaults(defaultValues),
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
    const onSubmit = async (data: RecurrenceFormValues) => {
        try {
            const result = await createRecurrenceAction(data);

            if (!result.success) {
                toast.add({
                    type: "error",
                    title: "Erro ao criar recorrência",
                    description: result.error ?? "Não foi possível criar a recorrência.",
                    priority: "high",
                });
                return;
            }

            toast.add({
                type: "success",
                title: "Recorrência criada",
                description: `A recorrência "${data.name}" foi criada com sucesso.`,
            });
            onClose();
        } catch (error) {
            console.error("[useCreateRecurrenceModal] Falha ao criar recorrência:", error);
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
