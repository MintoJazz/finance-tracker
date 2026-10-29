"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { restoreWalletAction } from "@/modules/wallets/ui/actions/restore-wallet.action";
import type { RestoreWalletModalInput, RestoreWalletModalProps } from "./types";

export function useRestoreWalletModal(input: RestoreWalletModalInput): RestoreWalletModalProps {
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

    const onOpenChangeComplete = useCallback((open: boolean) => {
        if (!open) {
            clearQueryParams();
        }
    }, [clearQueryParams]);

    const onConfirm = async () => {
        setIsSubmitting(true);
        try {
            const result = await restoreWalletAction({ id: input.id });
            if (!result.success) {
                setIsSubmitting(false);
                toast.add({
                    type: "error",
                    title: "Erro ao desarquivar",
                    description: result.error ?? "Não foi possível desarquivar a carteira. Tente novamente.",
                    priority: "high",
                });
                return;
            }

            toast.add({
                type: "success",
                title: "Carteira desarquivada",
                description: `A carteira "${input.name}" foi desarquivada com sucesso.`,
            });

            onClose();
        } catch (error) {
            setIsSubmitting(false);
            console.error("[useRestoreWalletModal] Erro ao desarquivar carteira:", error);
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
        walletName: input.name,
        isSubmitting,
        onConfirm,
        onClose,
        onOpenChangeComplete,
    };
}
