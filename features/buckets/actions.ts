import { prisma } from "@/lib/prisma";

export const findAllBuckets = async () => prisma.bucket.findMany()