"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import type { ChangeInstallmentCardValues } from "@/modules/installments/models/schemas/installment-card.schema";
import { changeInstallmentCardAction } from "@/modules/installments/ui/actions/change-installment-card.action";
import type {
    ChangeInstallmentCardModalInput,
    ChangeInstallmentCardModalProps,
} from "./types";

export function useChangeInstallmentCardModal(
    input: ChangeInstallmentCardModalInput
): ChangeInstallmentCardModalProps {
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

    const onSubmit = async (values: ChangeInstallmentCardValues) => {
        const result = await changeInstallmentCardAction(
            input.installment.id,
            values
        );
        if (!result.success) {
            toast.add({
                type: "error",
                title: "Erro ao trocar cartão",
                description: result.error,
                priority: "high",
            });
            return;
        }

        const cardName =
            input.cards.find((c) => c.id === result.data.cardId)?.name ?? "selecionado";
        toast.add({
            type: "info",
            title: "Troca de cartão validada (simulação)",
            description: `Parcelas em faturas abertas vinculadas ao cartão ${cardName}. Persistência no próximo ciclo de backend.`,
        });
        onClose();
    };

    return {
        isOpen,
        installment: input.installment,
        cards: input.cards,
        onSubmit,
        onClose,
        onOpenChangeComplete,
    };
}
