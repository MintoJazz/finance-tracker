"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

interface UseAdjustModalOptions<TForm> {
    /** Ex.: "Ajuste de prazos" — usado no toast de sucesso. */
    label: string;
    /** Nome da entidade ajustada (cartão/recorrência). */
    entityName?: string;
    /**
     * Persistência do ajuste. Escopo atual é só frontend: sem `persist`,
     * o submit apenas informa que o salvamento chega em breve.
     */
    persist?: (data: TForm) => Promise<{ success: boolean; error?: string }>;
}

/** Ciclo de vida de modais de rota interceptada (abre aberto, fecha e volta). */
export function useAdjustModal<TForm>({
    label,
    entityName,
    persist,
}: UseAdjustModalOptions<TForm>) {
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

    const onSubmit = useCallback(
        async (data: TForm) => {
            if (!persist) {
                toast.add({
                    type: "info",
                    title: label,
                    description: `O registro do ajuste${
                        entityName ? ` de ${entityName}` : ""
                    } estará disponível em breve.`,
                });
                onClose();
                return;
            }

            const result = await persist(data);
            if (!result.success) {
                toast.add({
                    type: "error",
                    title: `Erro: ${label.toLowerCase()}`,
                    description: result.error ?? "Não foi possível salvar o ajuste.",
                    priority: "high",
                });
                return;
            }
            toast.add({ type: "success", title: `${label} registrado` });
            onClose();
        },
        [persist, label, entityName, onClose]
    );

    return { isOpen, onSubmit, onClose, onOpenChangeComplete };
}
