'use server'

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma"
import { BucketFormType, bucketSchema } from "../form/schema/bucket-schema";
import { Bucket } from "@/generated/prisma/client";

export async function createBucket(payload: BucketFormType) {
    const parsedData = bucketSchema.safeParse(payload)
    
    if (!parsedData.success) return { 
        success: false, 
        error: "Dados inválidos", 
        issues: parsedData.error.flatten().fieldErrors 
    }

    const { name, type, userId } = parsedData.data

    try {
        const userExists = await prisma.user.findUnique({ where: { id: userId } })
        if (!userExists) return { success: false, error: "Usuário não encontrado." }

        const bucketExists = await prisma.bucket.findFirst({ where: { userId, name } })
        if (bucketExists) return { success: false, error: "Você já possui um Bucket com este nome." }

        const newBucket = await prisma.bucket.create({ data: { userId, type, name } })

        revalidatePath('/buckets', 'layout')
        return { success: true, data: newBucket }

    } catch (error) {
        console.error("Erro ao criar bucket:", error)
        return { success: false, error: "Ocorreu um erro interno ao tentar criar o Bucket." }
    }
}

export const killBucketsByKey = async (where: Partial<Bucket>) => {
    await prisma.bucket.deleteMany({ where })
    revalidatePath('/buckets', 'layout')
}