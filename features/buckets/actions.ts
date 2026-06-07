import { prisma } from "@/lib/prisma"

export const findBucketOptions = async () => prisma.bucket.findMany()

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

export const findBucketById = async (id: string) =>
    await prisma.bucket.findUniqueOrThrow({
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
