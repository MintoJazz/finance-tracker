"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import type { RecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import { updateRecurrenceAction } from "@/modules/recurrences/ui/actions/update-recurrence.action";
import { getRecurrenceFormDefaults } from "@/modules/recurrences/ui/utils/recurrence-form.utils";
import type { EditRecurrenceModalInput, EditRecurrenceModalProps } from "./types";

export function useEditRecurrenceModal(
    input: EditRecurrenceModalInput
): EditRecurrenceModalProps {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);
    const hasNavigatedRef = useRef(false);

    const { balanceId, name, categoryId, subcategoryId } = input;
    const initialData = useMemo(
        () => getRecurrenceFormDefaults({ name, categoryId, subcategoryId }),
        [name, categoryId, subcategoryId]
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

    const onSubmit = async (data: RecurrenceFormValues) => {
        try {
            const result = await updateRecurrenceAction({
                id: balanceId,
                name: data.name,
                categoryId: data.categoryId,
                newCategory: data.newCategory,
                subcategoryId: data.subcategoryId,
                newSubcategory: data.newSubcategory,
            });

            if (!result.success) {
                toast.add({
                    type: "error",
                    title: "Erro ao editar recorrência",
                    description: result.error ?? "Não foi possível editar a recorrência.",
                    priority: "high",
                });
                return;
            }

            toast.add({
                type: "success",
                title: "Recorrência atualizada",
                description: `A recorrência "${result.data?.name ?? data.name}" foi atualizada.`,
            });
            onClose();
        } catch (error) {
            console.error("[useEditRecurrenceModal] Falha ao editar recorrência:", error);
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
