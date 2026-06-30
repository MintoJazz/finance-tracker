import { prisma } from "@/lib/prisma";

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