import { z } from "zod";
import { ProfileSchema } from "./profile.schema";
import { UserContextOptionSchema } from "@/modules/space/core/schemas/context.schema";

export const UserContextDataSchema = z.object({
  profile: ProfileSchema,
  contexts: z.array(UserContextOptionSchema),
  activeContextId: z.number().int().positive(),
});

export type UserContextData = z.infer<typeof UserContextDataSchema>;
