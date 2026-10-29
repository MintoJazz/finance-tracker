"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateWalletSchema, type CreateWalletFormValues } from "@/modules/wallets/models/wallet.schema";
import { createWalletAction } from "../../actions/create-wallet.action";
import { toast } from "@/components/ui/toast";
import type { CreateWalletModalInput, CreateWalletModalProps } from "./types";

export function useCreateWalletModal(input?: CreateWalletModalInput): CreateWalletModalProps {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const hasNavigatedRef = useRef(false);

    const form = useForm<CreateWalletFormValues>({
        resolver: zodResolver(CreateWalletSchema),
        defaultValues: {
            name: input?.defaultName ?? "",
        },
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
        setIsSubmitting(true);
        try {
            const result = await createWalletAction(data);
            if (!result.success) {
                setIsSubmitting(false);
                toast.add({
                    type: "error",
                    title: "Erro ao criar carteira",
                    description: result.error ?? "Não foi possível criar a carteira.",
                    priority: "high",
                });
                return;
            }

            toast.add({
                type: "success",
                title: "Carteira criada",
                description: `A carteira "${data.name}" foi criada com sucesso.`,
            });

            onClose();
        } catch (error) {
            setIsSubmitting(false);
            console.error("[useCreateWalletModal] Falha ao criar carteira:", error);
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
