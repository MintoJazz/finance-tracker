"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/toast";
import type { RestoreCardModalInput, RestoreCardModalProps } from "./types";
import { restoreCardAction } from "../../actions/restore-card.action";

export function useRestoreCardModal(
    input: RestoreCardModalInput
): RestoreCardModalProps {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isOpen, setIsOpen] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const hasClosedRef = useRef(false);

    const clearQueryParams = useCallback(() => {
        if (hasClosedRef.current) return;
        hasClosedRef.current = true;

        const params = new URLSearchParams(searchParams.toString());
        params.delete("restore");

        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname);
    }, [router, pathname, searchParams]);

    const onClose = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => {
            clearQueryParams();
        }, 300);
    }, [clearQueryParams]);

    const onOpenChangeComplete = useCallback(
        (open: boolean) => {
            if (!open) {
                clearQueryParams();
            }
        },
        [clearQueryParams]
    );

    const onConfirm = async () => {
        setIsSubmitting(true);
        try {
            const result = await restoreCardAction({ id: input.id });
            if (!result.success) {
                setIsSubmitting(false);
                toast.add({
                    type: "error",
                    title: "Erro ao desarquivar",
                    description: result.error ?? "Não foi possível desarquivar o cartão. Tente novamente.",
                    priority: "high",
                });
                return;
            }

            toast.add({
                type: "success",
                title: "Cartão desarquivado",
                description: `O cartão "${input.name}" foi desarquivado com sucesso.`,
            });

            onClose();
        } catch (error) {
            setIsSubmitting(false);
            console.error("[useRestoreCardModal] Erro ao desarquivar cartão:", error);
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
        entityName: input.name,
        isSubmitting,
        onConfirm,
        onClose,
        onOpenChangeComplete,
    };
}