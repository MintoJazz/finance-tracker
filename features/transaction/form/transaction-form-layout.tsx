import { FieldErrors, UseFormReturn } from "react-hook-form";
import TransactionForm from "./transaction-form";
import { TransactionAmountField } from "./fields/amount-field";
import { Bucket } from "@/generated/prisma/client";
import { TransactionFormType } from "./schema/types";
import { TransactionDescriptionField } from "./fields/description-field";
import { TransactionDateField } from "./fields/date-field";
import TransactionBucketField from "./fields/bucket-field";
import TransactionBadgeList from "./fields/badge-list-field";
import { BucketProvider } from "@/features/buckets/contexts/bucket-context";
import { schemaBadgeList } from "./schema/schema-registry";

interface Props {
    form: UseFormReturn<TransactionFormType>
    buckets: Bucket[]
    isIncome: boolean
    onError: (errors: FieldErrors<TransactionFormType>) => void;
    onSubmit: (data: TransactionFormType) => void;
}

export default function TransactionFormLayout({ form, buckets, isIncome, onError, onSubmit }: Props) {
    const availableBadges = schemaBadgeList.filter(s => s != ((isIncome) ? "addDestination" : "addOrigin"))

    return <BucketProvider buckets={buckets} >
        <TransactionForm form={form} onError={onError} onSubmit={onSubmit}>
            <TransactionAmountField />
            <TransactionDescriptionField />
            <TransactionDateField />
            <TransactionBucketField otherBucket={(isIncome) ? "Destino" : "Origem"} buckets={buckets} />
            <TransactionBadgeList availableBadges={availableBadges} />
        </TransactionForm>
    </BucketProvider>
}
