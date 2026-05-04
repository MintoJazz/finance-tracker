import { Movement } from "@/generated/prisma/browser";
import { Transaction } from "@/generated/prisma/client";

export type TransactionDetails = Transaction & {
    movements: Movement[]
}