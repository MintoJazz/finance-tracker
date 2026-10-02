import { z } from "zod";
import { RoleSchema } from "./context-member.schema";

export const FinancialContextSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1, "Nome do contexto é obrigatório"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const UserContextOptionSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  role: RoleSchema,
  isDefault: z.boolean().optional(),
});

export type FinancialContext = z.infer<typeof FinancialContextSchema>;
export type UserContextOption = z.infer<typeof UserContextOptionSchema>;
