"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FieldErrors, Resolver, useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { BucketOption } from "@/types/database"
import { BucketProvider } from "@/features/buckets/contexts/bucket-context"
import { TransactionFormType } from "../form/schema/types"
import { transactionFormSchema } from "../form/schema/transaction-schema"
import TransactionForm from "../form/transaction-form"
import { createTransactionAction } from "../actions"

interface Props {
    buckets: BucketOption[]
    defaultType?: "EXPENSE" | "INCOME"
    onSuccess?: () => void
}

export function CreateTransactionFormContent({
    buckets,
    defaultType = "EXPENSE",
    onSuccess,
}: Props) {
    const router = useRouter()
    const isIncome = defaultType === "INCOME"

    const resolver = zodResolver(transactionFormSchema) as Resolver<TransactionFormType>
    const form = useForm<TransactionFormType>({
        resolver,
        defaultValues: {
            description: "",
            amount: 0,
            activeBadges: [],
            type: defaultType,
        },
        mode: "onChange",
    })

    const onError = (errors: FieldErrors<TransactionFormType>) => {
        toast.error("Erro ao validar os dados da transação!")
        console.log("❌ FALHA NA VALIDAÇÃO:", errors)
    }

    const handleSubmit = async (data: TransactionFormType) => {
        try {
            const result = await createTransactionAction(data)
            if (result && !result.success) {
                toast.error(result.error ?? "Não foi possível criar a transação.")
                return
            }
            toast.success("Transação criada com sucesso!")
            if (onSuccess) {
                onSuccess()
            } else {
                router.back()
            }
        } catch (error) {
            toast.error("Não foi possível criar a transação.")
            console.error("[ERRO AO CRIAR TRANSAÇÃO]", error)
        }
    }

    return (
        <BucketProvider buckets={buckets ?? []}>
            <TransactionForm
                form={form}
                onError={onError}
                onSubmit={handleSubmit}
                isIncome={isIncome}
            />
        </BucketProvider>
    )
}
