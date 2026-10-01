import { ContextMemberType, Role } from "../schemas/context-member.schema"

export class SpacePolicy {
    private static readonly rolesWithViewAccess: Role[] = ["OWNER", "ADMIN", "MEMBER"]
    private static readonly rolesWithManageAccess: Role[] = ["OWNER", "ADMIN"]

    static readonly canViewBalances = (member: ContextMemberType): boolean => this.rolesWithViewAccess.includes(member.role)
    static readonly canManageBalances = (member: ContextMemberType): boolean => this.rolesWithManageAccess.includes(member.role)
}