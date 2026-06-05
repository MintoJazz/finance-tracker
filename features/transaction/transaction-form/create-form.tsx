'use client'

import { Control, FieldErrors, FieldValues, Resolver, useForm, useWatch } from "react-hook-form"
import { TransactionFormType } from "./schemas/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { transactionFormSchema } from "./schemas"
import TransactionFormLayout from "./form-layou"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Bucket } from "@/generated/prisma/client"
import { useEffect } from "react"
import { toast } from "sonner"

function FormDebug<T extends FieldValues>({ control }: { control: Control<T> }) {
    const formValues = useWatch({ control })

    return (
        <pre className="mt-8 p-4 bg-black text-green-400 text-xs rounded-md overflow-auto">
            {JSON.stringify(formValues, null, 2)}
        </pre>
    )
}

interface Props {
    buckets: Bucket[]
    isOpen: boolean
    isIncome: boolean
    onClose?: (open: boolean) => void
    onSubmit: (data: TransactionFormType) => void
}

export default function CreateTransaction({ isOpen, onClose, buckets, onSubmit, isIncome }: Props) {
    const resolver = zodResolver(transactionFormSchema) as Resolver<TransactionFormType>
    const form = useForm<TransactionFormType>({
        resolver,
        defaultValues: {
            description: "",
            amount: 0,
            activeBadges: [],
            type: "EXPENSE"
        },
        mode: "onChange"
    })

    const onError = (errors: FieldErrors<TransactionFormType>) => {
        toast.error("Erro ao criar Transação!")
        console.log("❌ FALHA NA VALIDAÇÃO:", errors)
    }

    form.setValue("type", (isIncome) ? "INCOME" : "EXPENSE")
    useEffect(() => {if (!isOpen) form.reset()}, [isOpen, form])


    return <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Nova Transação</DialogTitle>
                <DialogDescription>Insira aqui os dados da nova transação</DialogDescription>
            </DialogHeader>
            <div className="flex-1 min-h-0 overflow-y-auto p-1 no-scrollbar">
                <TransactionFormLayout form={form} onError={onError} onSubmit={onSubmit} buckets={buckets} />
                <FormDebug control={form.control} />
            </div>
        </DialogContent>
    </Dialog>
}