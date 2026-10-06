"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateWalletSchema, type CreateWalletFormValues } from "@/modules/account/core/schemas/wallet.schema";
import { updateWalletAction } from "../../actions/update-wallet.action";
import { toast } from "@/components/ui/toast";
import type { EditWalletModalInput, EditWalletModalProps } from "./types";

export function useEditWalletModal(input?: EditWalletModalInput): EditWalletModalProps {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const hasNavigatedRef = useRef(false);

    const form = useForm<CreateWalletFormValues>({
        resolver: zodResolver(CreateWalletSchema),
        defaultValues: {
            name: input?.defaultName ?? "",
        },
        values: input?.defaultName !== undefined ? { name: input.defaultName } : undefined,
    });

    const navigateBack = useCallback(() => {
        if (!hasNavigatedRef.current) {
            hasNavigatedRef.current = true;
            router.back();
        }
    }, [router]);

    const onClose = useCallback(() => {
        setIsOpen(false);
        // Fallback para assegurar a navegação caso a animação não chame onOpenChangeComplete
        setTimeout(() => {
            navigateBack();
        }, 300);
    }, [navigateBack]);

    const onOpenChangeComplete = useCallback((open: boolean) => {
        if (!open) {
            navigateBack();
        }
    }, [navigateBack]);

    const onSubmit = async (data: CreateWalletFormValues) => {
        if (!input?.id) {
            toast.add({
                type: "error",
                title: "Erro ao atualizar carteira",
                description: "Identificador da carteira não encontrado.",
                priority: "high",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await updateWalletAction({
                id: input.id,
                name: data.name,
            });

            if (!result.success) {
                setIsSubmitting(false);
                toast.add({
                    type: "error",
                    title: "Erro ao atualizar carteira",
                    description: result.error ?? "Não foi possível atualizar a carteira.",
                    priority: "high",
                });
                return;
            }

            toast.add({
                type: "success",
                title: "Carteira atualizada",
                description: `A carteira "${data.name}" foi atualizada com sucesso.`,
            });

            onClose();
        } catch (error) {
            setIsSubmitting(false);
            console.error("[useEditWalletModal] Falha ao atualizar carteira:", error);
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
        isSubmitting,
        form,
        onSubmit,
        onClose,
        onOpenChangeComplete,
    };
}
