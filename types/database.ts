import { Movement } from "@/generated/prisma/browser";
import { Bucket, Transaction, User } from "@/generated/prisma/client";

export interface TransactionDetails extends Transaction {
    movements: Movement[]
}

export interface BucketList extends Bucket {
    user: User
    balance: number
}

export interface UserOption {
    id: number
    name: string
}

export interface BucketOption {
    id: number
    name: string
}