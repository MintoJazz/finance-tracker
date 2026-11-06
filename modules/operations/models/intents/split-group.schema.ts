import { z } from "zod"

export const SplitGroupModeSchema = z.enum(["EQUAL", "WEIGHTS"])
export type SplitGroupMode = z.infer<typeof SplitGroupModeSchema>

export const SplitGroupSliceSchema = z.object({
  mode: SplitGroupModeSchema.default("EQUAL"),
  memberWeights: z.record(z.string(), z.number().int().positive()).optional(),
})

export type SplitGroupSlice = z.infer<typeof SplitGroupSliceSchema>

