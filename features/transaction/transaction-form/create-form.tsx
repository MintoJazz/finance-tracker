'use client'

import { Control, FieldErrors, FieldValues, Resolver, useForm, useWatch } from "react-hook-form"
import { TransactionFormType } from "./schemas/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { transactionFormSchema } from "./schemas"
import TransactionFormLayout from "."
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Bucket } from "@/generated/prisma/client"

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
    onClose?: () => void
    onSubmit: (data: TransactionFormType) => void
}

const resolver = zodResolver(transactionFormSchema) as Resolver<TransactionFormType>

export default function CreateTransaction({ isOpen, onClose, buckets, onSubmit }: Props) {
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
        console.error("❌ FALHA NA VALIDAÇÃO:", errors)
    }

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