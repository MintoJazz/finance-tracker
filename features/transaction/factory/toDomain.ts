import { TransactionDetails } from "@/types/database";
import { transactionFormSchema } from "../transaction-form/schemas";
import { TransactionFormType } from "../transaction-form/schemas/types";
import { MOVEMENT_BUILDERS } from "./movement-builder-registry";
import { Movement } from "@/generated/prisma/client";

export function toDomain(data: TransactionFormType): TransactionDetails {
    const schema = transactionFormSchema.parse(data)
    const movements: Movement[] = MOVEMENT_BUILDERS[schema.type](schema).map((m) => ({
        ...m as Movement,
        id: 0,
        transactionId: 0
    }))

    return {
        id: 0,
        description: schema.description,
        amount: schema.amount,
        date: schema.date,
        type: schema.type,
        movements,
        workspaceId: 0,
        isShared: false,
        kind: "DEFAULT",
        status: (schema.date < new Date()) ? "PROJECTED" : "PENDING"
    }
}