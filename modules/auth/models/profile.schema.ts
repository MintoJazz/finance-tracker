import { z } from "zod";

export const ProfileSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  avatarUrl: z.string().nullable().optional(),
  initials: z.string().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;
