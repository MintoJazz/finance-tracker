import { Movement, MovementRole } from "@/generated/prisma/browser";
import { Bucket, Transaction, User } from "@/generated/prisma/client";

export interface TransactionListMovement {
    bucket: BucketOption | null
    id: number;
    amount: number;
    bucketId: number | null;
    transactionId: number;
    role: MovementRole;
}

export interface TransactionDetails extends Transaction {
    movements: TransactionListMovement[];
}


export interface BucketList extends Bucket {
    user: User
    balance: number
}

// types/database.ts
export interface BucketBalance {
    id: number
    name: string
    balance: number
    movements: (Movement & {
        description: string
    })[]
}

export interface UserOption {
    id: number
    name: string
}

export interface BucketOption {
    id: number
    name: string
}