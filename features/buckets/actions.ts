'use server'

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma"
import { Bucket } from "@/generated/prisma/client";
import { createBucket } from "@/server/bucket/create-bucket";
import { BucketFormType } from "@/features/buckets/form/schema/bucket-schema";
import { updateBucketsByKey } from "@/server/bucket/update-bucket";

export async function createBucketAction(payload: BucketFormType) {
    try {
        const result = await createBucket(payload)

        if (result.success) {
            revalidatePath("/buckets", "layout")
        }

        return result
    } catch (error) {
        console.error("Erro ao criar bucket:", error)

        return {
            success: false,
            error: "Ocorreu um erro interno ao tentar criar o Bucket.",
        }
    }
}

export async function updateBucketAction(payload: BucketFormType, where: Partial<Bucket>) {
    try {
        const result = await updateBucketsByKey(payload, where)

        revalidatePath('/buckets', 'layout')
        return result

    } catch (error) {
        console.error("Erro ao atualizar bucket:", error)
        return { success: false, error: "Ocorreu um erro interno ao tentar criar o Bucket." }
    }
}

export async function killBucketAction(where: Partial<Bucket>) {
    try {
        await prisma.bucket.deleteMany({ where })
        revalidatePath('/buckets', 'layout')
    } catch (error) {
        console.error("Erro ao excluir bucket:", error)
        return { success: false, error: "Ocorreu um erro interno ao tentar criar o Bucket." }
    }
}