import { FieldErrors, UseFormReturn } from "react-hook-form";
import TransactionForm from "./form-layout";
import { TransactionFormType } from "./schemas/types";
import TransactionBadgeList from "./fields/badge-list-field";
import { TransactionAmountField } from "./fields/amount-field";
import { TransactionDateField } from "./fields/date-field";
import { TransactionDescriptionField } from "./fields/description-field";
import { Bucket } from "@/generated/prisma/client";
import TransactionBucketField from "./fields/bucket-field";

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