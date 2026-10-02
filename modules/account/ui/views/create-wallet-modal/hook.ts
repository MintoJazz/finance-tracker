"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateWalletSchema, type CreateWalletFormValues } from "@/modules/account/core/schemas/wallet.schema";
import { createWalletAction } from "../../actions/create-wallet.action";
import { toast } from "@/components/ui/toast";
import type { CreateWalletModalInput, CreateWalletModalProps } from "./types";

export function useCreateWalletModal(input?: CreateWalletModalInput): CreateWalletModalProps {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreateWalletFormValues>({
        resolver: zodResolver(CreateWalletSchema),
        defaultValues: {
            name: input?.defaultName ?? "",
        },
    });

    const onClose = () => {
        setIsOpen(false);
        router.back();
    };

    const onSubmit = async (data: CreateWalletFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await createWalletAction(data);
            if (!result.success) {
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

            setIsOpen(false);
            router.back();
            router.refresh();
        } catch (error) {
            console.error("[useCreateWalletModal] Falha ao criar carteira:", error);
            toast.add({
                type: "error",
                title: "Erro inesperado",
                description: "Ocorreu um erro interno. Tente novamente mais tarde.",
                priority: "high",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isOpen,
        isSubmitting,
        form,
        onSubmit,
        onClose,
    };
}
