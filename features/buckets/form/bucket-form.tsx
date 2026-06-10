import { FieldErrors, UseFormReturn } from "react-hook-form";
import { BucketFormType } from "./schema/bucket-schema";
import Form from "@/components/form-component";
import BucketNameField from "./fields/name-field";
import { ReactNode } from "react";

interface Props {
    children?: ReactNode
    form: UseFormReturn<BucketFormType>
    onError?: (errors: FieldErrors<BucketFormType>) => void;
    onSubmit: (data: BucketFormType) => void;
}

export default function BucketForm({ children, ...drilling }: Props) {
    return <Form {...drilling} id="bucket-form" >
        <BucketNameField />
        {children}
    </Form>
}