import z from "zod";

export const RoleSchema = z.enum(["OWNER", "ADMIN", "MEMBER", "DEPENDENT"])
export const StatusSchema = z.enum(["PENDING", "ACTIVE", "REMOVED"])

export type Role = z.infer<typeof RoleSchema>
export type Status = z.infer<typeof StatusSchema>

export const ContextMemberSchema = z.object({
  contextId: z.number(),
  partyId: z.number(),
  invitedByPartyId: z.number().optional(),
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "DEPENDENT"]),
  status: z.enum(["PENDING", "ACTIVE", "REMOVED"]),
  invitedAt: z.coerce.date(),
  joinedAt: z.coerce.date().optional(),
  removedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ContextMemberType = z.infer<typeof ContextMemberSchema>;