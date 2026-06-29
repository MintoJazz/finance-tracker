"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BucketFormType, bucketSchema } from "../form/schema/bucket-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, Resolver, useForm } from "react-hook-form";
import { BucketType } from "@/generated/prisma/enums";
import BucketForm from "../form/bucket-form";
import { UserOption } from "@/types/database";
import { toast } from "sonner";
import BucketUserField from "../form/fields/user-field";
import BucketTypeField from "../form/fields/type-field";

interface Props {
    open: boolean
    users: UserOption[]
    onOpenChange?: (open: boolean) => void
    onSubmit: (data: BucketFormType) => void;
}

export default function CreateBucket({ users, onSubmit, ...dialogDrilling }: Props) {
    const resolver = zodResolver(bucketSchema) as Resolver<BucketFormType>
    const form = useForm<BucketFormType>({
        resolver,
        defaultValues: {
            name: "",
            type: BucketType.WALLET
        },
        mode: "onChange"
    })

    const handleOnError = (errors: FieldErrors<BucketFormType>) => {
        toast.error("Erro ao criar Transação!")
        console.log("❌ FALHA NA VALIDAÇÃO:", errors)
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