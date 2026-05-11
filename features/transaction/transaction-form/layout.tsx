import { FieldErrors, UseFormReturn } from "react-hook-form";
import TransactionForm, { TransactionAmountField, TransactionDateField, TransactionDescriptionField } from ".";
import { TransactionFormType } from "./schemas/types";

interface Props {
    form: UseFormReturn<TransactionFormType>
    onError: (errors: FieldErrors<TransactionFormType>) => void;
    onSubmit: (data: TransactionFormType) => Promise<void>;
}

export default function TransactionFormLayout({ form, onError, onSubmit }: Props) {
    return <TransactionForm form={form} onError={onError} onSubmit={onSubmit}>
        <TransactionAmountField />
        <TransactionDescriptionField />
        <TransactionDateField />
    </TransactionForm>
}