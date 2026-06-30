import { prisma } from "@/lib/prisma";

export const findAllBucketOptions = async () => prisma.bucket.findMany({ select: {
    id: true,
    name: true
} })