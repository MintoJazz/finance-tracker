import { findAllUserOptions } from "@/features/user/server/queries"
import { UserOption } from "@/types/database"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect } from "react"
import { useForm, FieldErrors, Resolver } from "react-hook-form"
import { toast } from "sonner"
import { bucketSchema, BucketFormType } from "../form/schema/bucket-schema"
import { Dialog, DialogDescription, DialogTitle, DialogContent, DialogHeader } from "@/components/ui/dialog"
import BucketForm from "../form/bucket-form"
import BucketTypeField from "../form/fields/type-field"
import BucketUserField from "../form/fields/user-field"

interface Props {
    defaultValues: BucketFormType
    open: boolean
    onOpenChange?: (open: boolean) => void
    onError?: (errors: FieldErrors<BucketFormType>) => void;
    onSubmit: (data: BucketFormType) => void;
}

export default function UpdateBucketDialgo({ defaultValues, onSubmit, onError, ...dialogDrilling }: Props) {
    const [users, setUsers] = useState<UserOption[]>()
    useEffect(() => {
        findAllUserOptions().then(setUsers)
    }, [])

    const resolver = zodResolver(bucketSchema) as Resolver<BucketFormType>
    const form = useForm<BucketFormType>({
        resolver,
        defaultValues,
        mode: "onChange"
    })

    const handleOnError = (errors: FieldErrors<BucketFormType>) => {
        toast.error("Erro ao criar Transação!")
        console.log("❌ FALHA NA VALIDAÇÃO:", errors)
        if (onError) onError(errors)
    }

    return <Dialog {...dialogDrilling} >
        <DialogContent className="max-h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Novo Bucket</DialogTitle>
                <DialogDescription>Insira aqui os dados para criar um novo Bucket</DialogDescription>
            </DialogHeader>
            <div className="flex-1 min-h-0 overflow-y-auto p-1 no-scrollbar">
                <BucketForm form={form} onSubmit={onSubmit} onError={handleOnError} >
                    <BucketUserField users={users ?? []} />
                    <BucketTypeField />
                </BucketForm>
            </div>
        </DialogContent>
    </Dialog>
}