import { Movement } from "@/generated/prisma/client";
import { TransactionType } from "@/generated/prisma/enums";
import { TransactionFormType } from "../form/schema/types";

export const MOVEMENT_BUILDERS: Record<TransactionType, (data: TransactionFormType) => Partial<Movement>[]> = {
    EXPENSE: (data) => [{ amount: data.amount, role: "DEBIT", bucketId: data.bucketId }],
    INCOME: (data) => [{ amount: data.amount, role: "CREDIT", bucketId: data.bucketId }],
    TRANSFER: () => {throw new Error("TRANSFER type is not supported yet")}
}