"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { archiveWalletAction } from "@/modules/wallets/ui/actions/archive-wallet.action";
import type { ArchiveWalletModalInput, ArchiveWalletModalProps } from "./types";

export function useArchiveWalletModal(input: ArchiveWalletModalInput): ArchiveWalletModalProps {
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
        params.delete("archive");
        params.delete("delete");
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
            const result = await archiveWalletAction({ id: input.id });
            if (!result.success) {
                setIsSubmitting(false);
                toast.add({
                    type: "error",
                    title: "Erro ao arquivar",
                    description: result.error ?? "Não foi possível arquivar a carteira. Tente novamente.",
                    priority: "high",
                });
                return;
            }

            toast.add({
                type: "success",
                title: "Carteira arquivada",
                description: `A carteira "${input.name}" foi arquivada com sucesso.`,
            });

            onClose();
        } catch (error) {
            setIsSubmitting(false);
            console.error("[useArchiveWalletModal] Erro ao arquivar carteira:", error);
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
