"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FieldErrors, Resolver, useForm } from "react-hook-form"
import { BucketType } from "@/generated/prisma/enums"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { UserOption } from "@/types/database"
import { BucketFormType, bucketSchema } from "../form/schema/bucket-schema"
import { createBucketAction } from "../actions"
import BucketForm from "../form/bucket-form"
import BucketUserField from "../form/fields/user-field"
import BucketTypeField from "../form/fields/type-field"

interface Props {
    users: UserOption[]
    onSuccess?: () => void
}

export function CreateBucketFormContent({ users, onSuccess }: Props) {
    const router = useRouter()
    const resolver = zodResolver(bucketSchema) as Resolver<BucketFormType>
    const form = useForm<BucketFormType>({
        resolver,
        defaultValues: {
            name: "",
            type: BucketType.WALLET,
        },
        mode: "onChange",
    })

    const handleOnError = (errors: FieldErrors<BucketFormType>) => {
        toast.error("Erro ao validar o formulário!")
        console.log("❌ FALHA NA VALIDAÇÃO:", errors)
    }

    const handleSubmit = async (data: BucketFormType) => {
        try {
            const result = await createBucketAction(data)
            if (result && !result.success) {
                toast.error(result.error ?? "Não foi possível adicionar o novo bucket")
                return
            }
            toast.success("Bucket criado com sucesso!")
            if (onSuccess) {
                onSuccess()
            } else {
                router.back()
            }
        } catch (error) {
            toast.error("Não foi possível adicionar o novo bucket")
            console.error("[ERRO NA INSERÇÃO DO BUCKET]", error)
        }
    }

    return (
        <BucketForm
            form={form}
            onSubmit={handleSubmit}
            onError={handleOnError}
            submitText="Criar Bucket"
        >
            <BucketUserField users={users ?? []} />
            <BucketTypeField />
        </BucketForm>
    )
}
