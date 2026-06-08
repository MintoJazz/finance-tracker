import { FieldErrors, UseFormReturn } from "react-hook-form";
import { BucketFormType } from "./schema/bucket-schema";
import Form from "@/components/form-component";
import BucketNameField from "./fields/name-field";
import BucketTypeField from "./fields/type-field";
import BucketUserField from "./fields/user-field";
import { useUsersContext } from "@/features/user/context/user-options-provider";

interface Props {
    form: UseFormReturn<BucketFormType>
    onError?: (errors: FieldErrors<BucketFormType>) => void;
    onSubmit: (data: BucketFormType) => void;
}

export default function BucketForm({ ...drilling }: Props) {
    const { users } = useUsersContext()

    return <Form {...drilling} id="bucket-form" >
        <BucketNameField />
        <BucketUserField users={users} />
        <BucketTypeField />
    </Form>
}