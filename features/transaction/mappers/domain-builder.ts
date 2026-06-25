import { BucketOption, TransactionDetails, TransactionListMovement } from "@/types/database";
import { transactionFormSchema } from "../form/schema/transaction-schema";
import { TransactionFormType } from "../form/schema/types";
import { MOVEMENT_BUILDERS } from "./movement-builder-registry";
import { SchemaBadgeType } from "../form/schema/schema-registry";
import { BADGE_MODIFYERS } from "./badge-modifyers";

export function toDomain(data: TransactionFormType, buckets: BucketOption[]): TransactionDetails {
    const schema = transactionFormSchema.parse(data)
    console.log(MOVEMENT_BUILDERS[schema.type](schema));
    
    const movements: TransactionListMovement[] = MOVEMENT_BUILDERS[schema.type](schema).map((m) => ({
        ...m,
        bucket: buckets.find(b => b.id === m.bucketId),
        id: 0,
        transactionId: 0
    } as TransactionListMovement))

    return applyModifyers({
        id: 0,
        description: schema.description,
        amount: schema.amount,
        date: schema.date,
        type: schema.type,
        movements,
        status: (schema.date > new Date()) ? "PROJECTED" : "PENDING"
    }, schema)
}

export function applyModifyers(transaction: TransactionDetails, data: TransactionFormType): TransactionDetails {
    return data.activeBadges.reduce((acc, badge) => {
        const accTransaction = {transaction, ...acc} as TransactionDetails
        return BADGE_MODIFYERS[badge as SchemaBadgeType](accTransaction, data as TransactionFormType)
    }, transaction)
}