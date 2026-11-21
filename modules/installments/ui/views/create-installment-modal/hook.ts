"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import type { InstallmentFormValues } from "@/modules/installments/models/schemas/installment-form.schema";
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

    // TODO(backend): trocar por `createInstallmentAction(data)` (Result + revalidatePath).
    // Por ora só valida a UI: nada é persistido.
    const onSubmit = async (data: InstallmentFormValues) => {
        console.info("[useCreateInstallmentModal] Payload (prévia, não persistido):", data);
        toast.add({
            type: "info",
            title: "Prévia do formulário",
            description: `"${data.name}" não foi salvo: o backend de parcelamentos ainda não está conectado.`,
        });
        onClose();
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
