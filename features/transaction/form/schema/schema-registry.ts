import z, { ZodObject } from "zod";

export const schemaBadgeList = ["addOrigin", "addDestination"] as const;

export type SchemaBadgeType = typeof schemaBadgeList[number];

const toTransferSchema = z.object({
        bucketId: z.number().positive("Selecione um Bucket Válido"),
})

export const SCHEMA_REGISTRY: Record<SchemaBadgeType, ZodObject> = {
    addDestination: toTransferSchema,
    addOrigin: toTransferSchema,
}