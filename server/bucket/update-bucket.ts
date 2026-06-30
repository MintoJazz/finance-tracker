import { BucketFormType, bucketSchema } from "@/features/buckets/form/schema/bucket-schema"
import { Bucket } from "@/generated/prisma/client"
import { BatchPayload } from "@/generated/prisma/internal/prismaNamespace"
import { prisma } from "@/lib/prisma"
import { UseCaseResponse } from "@/types/use-case"

export async function updateBucketsByKey(payload: BucketFormType, where: Partial<Bucket>): Promise<UseCaseResponse<BatchPayload>> {
    const parsedData = bucketSchema.safeParse(payload)

    if (!parsedData.success) return {
        success: false,
        error: "Dados inválidos",
        issues: parsedData.error.flatten().fieldErrors
    }

    const { name, userId } = parsedData.data

    const bucketExists = await prisma.bucket.findFirst({ where: { userId, name } })
    if (bucketExists) return { success: false, error: "Você já possui um Bucket com este nome." }

    const updatedBuckets = await prisma.bucket.updateMany({ data: { name }, where })

    return { success: true, data: updatedBuckets }
}