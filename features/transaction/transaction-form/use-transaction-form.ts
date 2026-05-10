import { TransactionDetails } from "@/types/database";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionFormSchema } from "./schemas";
import { FieldErrors, Resolver, useForm } from "react-hook-form";
import { TransactionFormType } from "./schemas/types";

export function useTransactionForm(onSuccess: (data: TransactionFormType) => void, initialData?: TransactionDetails) {
    const resolver = zodResolver(transactionFormSchema) as Resolver<TransactionFormType>

    const form = useForm<TransactionFormType>({
        resolver,
        defaultValues: {
            amount: initialData?.amount ?? 0,
            description: initialData?.description ?? "",
            date: initialData?.date ?? new Date(),
            activeBadges: [],
            type: initialData?.type ?? "EXPENSE",
        }
    })

    const onSubmit = async (data: TransactionFormType) => {
        try {
            console.log("Dados prontos para salvar:", data)
            onSuccess(data)
        } catch (error) {
            console.error("Erro ao salvar transação:", error)
        }
    }

    const onError = (errors: FieldErrors<TransactionFormType>) => {
        console.error("Erros de validação do Zod:", errors)
    }

    return { form, onSubmit, onError }
}