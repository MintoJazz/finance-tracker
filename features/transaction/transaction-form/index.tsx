import { FieldErrors, UseFormReturn } from "react-hook-form";
import TransactionForm from "./form-layout";
import { TransactionFormType } from "./schemas/types";
import TransactionBadgeList from "./badge-list-field";
import { TransactionAmountField } from "./amount-field";
import { TransactionDateField } from "./date-field";
import { TransactionDescriptionField } from "./description-field";
import { Bucket } from "@/generated/prisma/client";
import TransactionBucketField from "./bucket-field";

interface Props {
    form: UseFormReturn<TransactionFormType>
    onError: (errors: FieldErrors<TransactionFormType>) => void;
    onSubmit: (data: TransactionFormType) => void;
    buckets: Bucket[]
}

export default function TransactionFormLayout({ form, buckets, onError, onSubmit }: Props) {
    return <TransactionForm form={form} onError={onError} onSubmit={onSubmit}>
        <TransactionAmountField />
        <TransactionDescriptionField />
        <TransactionDateField />
        <TransactionBucketField otherBucket="Origem" buckets={buckets} />
        <TransactionBadgeList />
    </TransactionForm>
}