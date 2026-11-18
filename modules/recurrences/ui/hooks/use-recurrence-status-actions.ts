"use client";

import { useCallback } from "react";
import { toast } from "@/components/ui/toast";
import { setRecurrenceActiveAction } from "@/modules/recurrences/ui/actions/set-recurrence-active.action";

/** Ativar/desativar uma recorrência (sem confirmação), com toast de retorno. */
export function useRecurrenceStatusActions(onChanged?: () => void | Promise<void>) {
    const setActive = useCallback(
        async (id: number, name: string, isActive: boolean) => {
            try {
                const result = await setRecurrenceActiveAction({ id, isActive });
                if (!result.success) {
                    toast.add({
                        type: "error",
                        title: isActive ? "Erro ao ativar" : "Erro ao desativar",
                        description: result.error,
                        priority: "high",
                    });
                    return;
                }
                toast.add({
                    type: "success",
                    title: isActive ? "Recorrência ativada" : "Recorrência desativada",
                    description: `A recorrência "${name}" foi ${isActive ? "ativada" : "desativada"}.`,
                });
                await onChanged?.();
            } catch (error) {
                console.error("[useRecurrenceStatusActions]", error);
                toast.add({
                    type: "error",
                    title: "Erro inesperado",
                    description: "Ocorreu um erro interno. Tente novamente mais tarde.",
                    priority: "high",
                });
            }
        },
        [onChanged]
    );

    return { setActive };
}
