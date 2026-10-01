import { z } from "zod";

export const stringBoolean = z.preprocess((val) => {
    if (typeof val === "string") return val === "true";
    return val;
}, z.boolean().optional());

export const BaseFilterSchema = z.object({
    showArchived: stringBoolean,
    search: z.string().optional(),
});

export type BaseFilter = z.infer<typeof BaseFilterSchema>;
