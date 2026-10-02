import type { Role } from "@/modules/space/core/schemas/context-member.schema";

export const CONTEXT_ROLE_LABELS: Record<Role, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  MEMBER: "Membro",
  DEPENDENT: "Dependente",
};

export function getRoleLabel(role: Role): string {
  return CONTEXT_ROLE_LABELS[role] ?? role;
}
