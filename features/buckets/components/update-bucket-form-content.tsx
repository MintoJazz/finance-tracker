"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FieldErrors, Resolver, useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Bucket } from "@/generated/prisma/client"
import { BucketList, UserOption } from "@/types/database"
import { BucketFormType, bucketSchema } from "../form/schema/bucket-schema"
import { updateBucketAction } from "../actions"
import BucketForm from "../form/bucket-form"
import BucketUserField from "../form/fields/user-field"
import BucketTypeField from "../form/fields/type-field"
import { toSchema } from "../mappers/toSchema"

interface Props {
    bucket: Bucket | BucketList
    users?: UserOption[]
    onSuccess?: () => void
}

export function UpdateBucketFormContent({ bucket, users, onSuccess }: Props) {
    const router = useRouter()
    const values = toSchema(bucket)

    const resolver = zodResolver(bucketSchema) as Resolver<BucketFormType>
    const form = useForm<BucketFormType>({
        resolver,
        values,
        mode: "onChange",
    })

    const handleOnError = (errors: FieldErrors<BucketFormType>) => {
        toast.error("Erro ao validar o formulário!")
        console.log("❌ FALHA NA VALIDAÇÃO:", errors)
    }

    const handleSubmit = async (data: BucketFormType) => {
        try {
            const result = await updateBucketAction(data, { id: bucket.id })
            if (result && !result.success) {
                toast.error(result.error ?? "Não foi possível editar o bucket")
                return
            }
            toast.success("Bucket atualizado com sucesso!")
            if (onSuccess) {
                onSuccess()
            } else {
                router.back()
            }
        } catch (error) {
            toast.error("Não foi possível editar o bucket")
            console.error("[ERRO NA EDIÇÃO DO BUCKET]", error)
        }
    }

    return (
        <BucketForm
            form={form}
            onSubmit={handleSubmit}
            onError={handleOnError}
            submitText="Salvar Alterações"
        >
            {users && users.length > 0 && <BucketUserField users={users} />}
            <BucketTypeField />
        </BucketForm>
    )
}
