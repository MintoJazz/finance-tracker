import { Bucket } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const killBucketsByKey = async(where: Partial<Bucket>) => await prisma.bucket.deleteMany({ where })