import { FieldErrors, UseFormReturn } from "react-hook-form";
import { BucketFormType } from "./schema/bucket-schema";
import Form from "@/components/form-component";
import BucketNameField from "./fields/name-field";
import BucketTypeField from "./fields/type-field";

interface Props {
    form: UseFormReturn<BucketFormType>
    onError: (errors: FieldErrors<BucketFormType>) => void;
    onSubmit: (data: BucketFormType) => void;
}

export default function BucketForm({ ...drilling }: Props) {
    return <Form {...drilling} >
        <BucketTypeField />
        <BucketNameField />
    </Form>
}