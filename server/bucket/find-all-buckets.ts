import { prisma } from "@/lib/prisma"

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