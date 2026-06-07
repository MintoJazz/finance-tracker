import { FieldErrors, UseFormReturn } from "react-hook-form";
import { TransactionAmountField } from "./fields/amount-field";
import { Bucket } from "@/generated/prisma/client";
import { TransactionFormType } from "./schema/types";
import { TransactionDescriptionField } from "./fields/description-field";
import { TransactionDateField } from "./fields/date-field";
import TransactionBucketField from "./fields/bucket-field";
import TransactionBadgeList from "./fields/badge-list-field";
import { BucketProvider } from "@/features/buckets/contexts/bucket-context";
import { schemaBadgeList } from "./schema/schema-registry";
import Form from "@/components/form-component";

interface Props {
    form: UseFormReturn<TransactionFormType>
    buckets: Bucket[]
    isIncome: boolean
    onError: (errors: FieldErrors<TransactionFormType>) => void;
    onSubmit: (data: TransactionFormType) => void;
}

export default function TransactionForm({ buckets, isIncome, ...drilling }: Props) {
    const availableBadges = schemaBadgeList.filter(s => s != ((isIncome) ? "addDestination" : "addOrigin"))

    return <BucketProvider buckets={buckets} >
        <Form {...drilling} >
            <TransactionAmountField />
            <TransactionDescriptionField />
            <TransactionDateField />
            <TransactionBucketField otherBucket={(isIncome) ? "Destino" : "Origem"} buckets={buckets} />
            <TransactionBadgeList availableBadges={availableBadges} />
        </Form>
    </BucketProvider>
}
