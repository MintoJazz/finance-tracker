import {
    ContextMemberRole,
    ContextMemberStatus,
    FriendshipStatus,
} from "../../generated/prisma/enums";
import { FinancialContextFactory } from "./context.factory";
import { hashPassword, type PrismaClientInstance } from "./helpers";

export class SystemSeedFactory {
    private constructor(
        public readonly prisma: PrismaClientInstance,
        private readonly defaultPasswordHash: string
    ) { }

    static async init(prisma: PrismaClientInstance): Promise<SystemSeedFactory> {
        const passwordHash = await hashPassword();
        return new SystemSeedFactory(prisma, passwordHash);
    }

    async createUser(params: {
        name: string;
        email: string;
        birthDate?: string;
        phone?: string;
        defaultContextName: string;
    }) {
        const party = await this.prisma.party.create({
            data: {
                name: params.name,
                birthDate: params.birthDate ? new Date(params.birthDate) : null,
                phone: params.phone ?? null,
                auth: {
                    create: {
                        email: params.email,
                        password: this.defaultPasswordHash,
                    },
                },
                contexts: {
                    create: {
                        role: ContextMemberRole.OWNER,
                        status: ContextMemberStatus.ACTIVE,
                        joinedAt: new Date(),
                        financialContext: {
                            create: { name: params.defaultContextName },
                        },
                    },
                },
            },
            include: { contexts: true },
        });

        const defaultContextId = party.contexts[0].contextId;
        const space = new FinancialContextFactory(this.prisma, defaultContextId, party.id);

        console.log(`  ✔ Usuário criado: ${params.email} (partyId=${party.id}, contextId=${defaultContextId})`);
        return { party, space };
    }

    async addFriendship(
        requesterPartyId: number,
        receiverPartyId: number,
        status: FriendshipStatus = FriendshipStatus.ACCEPTED
    ) {
        return this.prisma.friendship.create({
            data: {
                requesterId: requesterPartyId,
                receiverId: receiverPartyId,
                status,
                respondedAt: status !== FriendshipStatus.PENDING ? new Date() : null,
            },
        });
    }

    async createSpace(ownerPartyId: number, name: string): Promise<FinancialContextFactory> {
        const context = await this.prisma.financialContext.create({
            data: {
                name,
                members: {
                    create: {
                        partyId: ownerPartyId,
                        role: ContextMemberRole.OWNER,
                        status: ContextMemberStatus.ACTIVE,
                        joinedAt: new Date(),
                    },
                },
            },
        });

        console.log(`  🏠 Contexto compartilhado criado: "${name}" (contextId=${context.id}, ownerId=${ownerPartyId})`);
        return new FinancialContextFactory(this.prisma, context.id, ownerPartyId);
    }

    /**
     * Cria uma Party gerenciada (sem Auth) para representar filhos/dependentes em espaços familiares.
     */
    async createDependent(
        managerPartyId: number,
        params: { name: string; birthDate?: string }
    ) {
        return this.prisma.party.create({
            data: {
                name: params.name,
                birthDate: params.birthDate ? new Date(params.birthDate) : null,
                managedByPartyId: managerPartyId,
            },
        });
    }
}