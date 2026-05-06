import { Movement } from "@/generated/prisma/browser";
import { Transaction } from "@/generated/prisma/client";

export interface TransactionDetails extends Transaction {
    movements: Movement[]
}