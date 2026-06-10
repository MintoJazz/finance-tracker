import { Bucket } from "@/generated/prisma/browser";
import { BucketList } from "@/types/database";
import { BucketFormType } from "../form/schema/bucket-schema";

export const toSchema = (domain: Bucket|BucketList) => domain && ({
    userId: domain.userId,
    type: domain.type,
    name: domain.name
}) as BucketFormType