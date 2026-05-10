import TransactionForm, { TransactionAmountField, TransactionDateField, TransactionDescriptionField } from ".";
import { TransactionFormType } from "./schemas/types";
import { TransactionDetails } from "@/types/database";
import { useTransactionForm } from "./use-transaction-form";

interface Props {
    initialData?: TransactionDetails
    onSuccess: (data: TransactionFormType) => void
}

export default function TransactionFormLayout({ initialData, onSuccess }: Props) {
    const { form, onError, onSubmit } = useTransactionForm(onSuccess, initialData)

    return <TransactionForm form={form} onError={onError} onSubmit={onSubmit}>
        <TransactionAmountField />
        <TransactionDescriptionField />
        <TransactionDateField />
    </TransactionForm>
}