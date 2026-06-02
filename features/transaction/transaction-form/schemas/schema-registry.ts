import z, { ZodObject } from "zod";

export type SchemaBadgeType = "toTransfer";

export const SCHEMA_REGISTRY: Record<SchemaBadgeType, ZodObject> = {
    toTransfer: z.object({
        bucketId: z.number().positive("Selecione um Bucket Válido"),
        role: z.enum(['DEBIT', 'CREDIT', 'TRANSFER_CREDIT', 'TRANSFER_DEBIT'], { message: "Selecione um papel válido para a transferência" })
    })
}