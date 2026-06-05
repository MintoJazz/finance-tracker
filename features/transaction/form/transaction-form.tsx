'use client'

import { Button } from "@/components/ui/button"
import { TransactionFormType } from "./schema/types"
import { FormProvider, SubmitErrorHandler, UseFormReturn } from "react-hook-form"
import { FieldGroup } from "@/components/ui/field"
import { ReactNode } from "react"

interface Props {
    form: UseFormReturn<TransactionFormType>
    onSubmit: (form: TransactionFormType) => void,
    onError: SubmitErrorHandler<TransactionFormType>
    children: ReactNode
}

export default function TransactionForm({ form, onSubmit, onError, children }: Props) {
    return <FormProvider {...form}>
        <form id="transaction-form" onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col gap-6">
            <FieldGroup className="gap-2">
                {children}
            </FieldGroup>
            <Button type="submit" form="transaction-form">
                Salvar
            </Button>
        </form>
    </FormProvider>
}
