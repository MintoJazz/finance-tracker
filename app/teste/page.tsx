"use client"

import { useForm, useWatch, FieldErrors, FieldValues, Control, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { TransactionFormType } from "@/features/transaction/transaction-form/schemas/types"
import { transactionFormSchema } from "@/features/transaction/transaction-form/schemas"
import TransactionFormLayout from "@/features/transaction/transaction-form"

function FormDebug<T extends FieldValues>({ control }: { control: Control<T> }) {
    const formValues = useWatch({ control })

    return (
        <pre className="mt-8 p-4 bg-black text-green-400 text-xs rounded-md overflow-auto">
            {JSON.stringify(formValues, null, 2)}
        </pre>
    )
}

const resolver = zodResolver(transactionFormSchema) as Resolver<TransactionFormType>

export default function TransactionTestPage() {
    const form = useForm<TransactionFormType>({
        resolver,
        defaultValues: {
            description: "",
            amount: 0,
            activeBadges: []
        },
        mode: "onChange"
    })

    const onSubmit = async (data: TransactionFormType) => {
        try {
            console.log("✅ DADOS VALIDADOS COM SUCESSO:", data)
            alert(`Sucesso! \n\n${JSON.stringify(data, null, 2)}`)
        } catch (error) {
            console.error("Erro ao salvar transação:", error)
        }
    }

    const onError = (errors: FieldErrors<TransactionFormType>) => {
        console.error("❌ FALHA NA VALIDAÇÃO:", errors)
    }

    return (
        <div>
            <div className="mb-6 space-y-1">
                <h1 className="text-xl font-semibold tracking-tight">Nova Transação</h1>
                <p className="text-sm text-muted-foreground">
                    Teste de renderização do formulário desacoplado.
                </p>
            </div>

            <TransactionFormLayout form={form} onError={onError} onSubmit={onSubmit} />

            <FormDebug control={form.control} />
        </div>
    )
}