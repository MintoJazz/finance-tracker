"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    CardFormSchema,
    type CardFormValues,
} from "@/modules/account/core/schemas/card.schema";
import { createCardAction } from "../../actions/create-card.action";
import { toast } from "@/components/ui/toast";
import type { CreateCardModalInput, CreateCardModalProps } from "./types";

export function useCreateCardModal(
    input?: CreateCardModalInput
): CreateCardModalProps {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const hasNavigatedRef = useRef(false);

    const form = useForm<CardFormValues>({
        resolver: zodResolver(CardFormSchema),
        defaultValues: {
            name: input?.defaultValues?.name ?? "",
            limit: input?.defaultValues?.limit ?? 0,
            closingDay: input?.defaultValues?.closingDay ?? 1,
            dueDay: input?.defaultValues?.dueDay ?? 10,
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
        setTimeout(() => {
            navigateBack();
        }, 300);
    }, [navigateBack]);

    const onOpenChangeComplete = useCallback(
        (open: boolean) => {
            if (!open) {
                navigateBack();
            }
        },
        [navigateBack]
    );

    const onSubmit = async (data: CardFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await createCardAction(data);

            if (!result.success) {
                setIsSubmitting(false);
                toast.add({
                    type: "error",
                    title: "Erro ao criar cartão",
                    description: result.error ?? "Não foi possível criar o cartão.",
                    priority: "high",
                });
                return;
            }

            toast.add({
                type: "success",
                title: "Cartão criado",
                description: `O cartão "${data.name}" foi criado com sucesso.`,
            });

            onClose();
        } catch (error) {
            setIsSubmitting(false);
            console.error("[useCreateCardModal] Falha ao criar cartão:", error);
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