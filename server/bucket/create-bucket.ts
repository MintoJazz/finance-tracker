import { BucketFormType, bucketSchema } from "@/features/buckets/form/schema/bucket-schema"
import { Bucket } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { UseCaseResponse } from "@/types/use-case"

export async function createBucket(payload: BucketFormType): Promise<UseCaseResponse<Bucket>> {
    const parsedData = bucketSchema.safeParse(payload)

    if (!parsedData.success) {
        return {
            success: false,
            error: "Dados inválidos",
            issues: parsedData.error.flatten().fieldErrors,
        }
    }

    const { name, type, userId } = parsedData.data

    const userExists = await prisma.user.findUnique({
        where: { id: userId },
    })

    if (!userExists) {
        return {
            success: false,
            error: "Usuário não encontrado.",
        }
    }

    const bucketExists = await prisma.bucket.findFirst({
        where: { userId, name },
    })

    if (bucketExists) {
        return {
            success: false,
            error: "Você já possui um Bucket com este nome.",
        }
    }

    const newBucket = await prisma.bucket.create({
        data: {
            userId,
            type,
            name,
        },
    })

    return {
        success: true,
        data: newBucket,
    }
}