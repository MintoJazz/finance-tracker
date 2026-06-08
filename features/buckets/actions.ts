'use server'

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma"
import { BucketFormType, bucketSchema } from "../buckets/form/schema/bucket-schema";

export const findAllBucketOptions = async () => prisma.bucket.findMany({ select: {
    id: true,
    name: true
} })

export async function findAllBuckets() {
    const saldos = await prisma.movement.groupBy({
        by: ["bucketId"],
        _sum: { amount: true },
    })

    const buckets = await prisma.bucket.findMany({ include: { user: true } })

    return buckets.map((bucket) => ({
        ...bucket,
        balance: saldos.find((s) => s.bucketId === bucket.id)?._sum.amount ?? 0,
    }))
}

export const findBucketById = async (id: string) => await prisma.bucket.findUniqueOrThrow({
    where: { id: Number(id) },
    include: {
        movements: {
            include: {
                transaction: {
                    select: {
                        description: true,
                        date: true,
                        status: true,
                        type: true,
                    },
                },
            },
            orderBy: {
                transaction: {
                    date: "desc",
                },
            },
        },
        user: true,
    },
})

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

        revalidatePath('/buckets')
        return { success: true, data: newBucket }

    } catch (error) {
        console.error("Erro ao criar bucket:", error)
        return { success: false, error: "Ocorreu um erro interno ao tentar criar o Bucket." }
    }
}

export const deleteBucketById = async (id: number) => await prisma.bucket.delete({ where: { id } })