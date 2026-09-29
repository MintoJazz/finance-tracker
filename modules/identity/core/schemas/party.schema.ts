import { z } from "zod";

export const PartySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  documentNumber: z.string().nullable(),
  phone: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  birthDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreatePartySchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  documentNumber: z.string().nullable(),
  phone: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  birthDate: z.date().nullable(),
})

export type Party = z.infer<typeof PartySchema>;
export type CreatePartyFormType = z.infer<typeof CreatePartySchema>;