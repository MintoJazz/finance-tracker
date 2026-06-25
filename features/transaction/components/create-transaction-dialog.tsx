'use client'

import { FieldErrors, Resolver, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect } from "react"
import { toast } from "sonner"
import { TransactionFormType } from "../form/schema/types"
import { transactionFormSchema } from "../form/schema/transaction-schema"
import TransactionForm from "../form/transaction-form"
import { BucketProvider } from "@/features/buckets/contexts/bucket-context"
import { BucketOption } from "@/types/database"

interface Props {
    isOpen: boolean
    isIncome: boolean
    buckets: BucketOption[]
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
    useEffect(() => { if (!isOpen) form.reset() }, [isOpen, form])


    return <BucketProvider buckets={buckets ?? []} >
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Nova Transação</DialogTitle>
                    <DialogDescription>Insira aqui os dados da nova transação</DialogDescription>
                </DialogHeader>
                <div className="flex-1 min-h-0 overflow-y-auto p-1 no-scrollbar">
                    <TransactionForm form={form} onError={onError} onSubmit={onSubmit} isIncome={isIncome} />
                </div>
            </DialogContent>
        </Dialog>
    </BucketProvider>
}
