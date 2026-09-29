import { AuthDefaultIncludes } from "./prisma.queries";
import { AuthMapper } from "@/modules/identity/infra/mappers/auth.mapper";
import { IAuthRepository } from "@/modules/identity/core/types/auth-repository.interface";
import { CreateUserType } from "@/modules/identity/core/schemas/signup.schema";
import { prisma } from "@/lib/prisma";
import { Party } from "@/modules/identity/core/schemas/party.schema";

export class PrismaAuthRepository implements IAuthRepository {
    findPartyById(id: number): Promise<Party | null> {
        throw new Error("Method not implemented.");
    }

    findDefaultContext = async (partyId: number) => await prisma.contextMember.findFirst({
        where: { partyId, role: "OWNER" },
        select: { contextId: true }
    }) ?? null;

    async findAuthByEmail(email: string) {
        const raw = await prisma.auth.findUnique({
            where: { email },
            include: AuthDefaultIncludes,
        });

        if (!raw) return null;
        return AuthMapper.toDomain(raw);
    }

    async create(input: CreateUserType) {
        const data = AuthMapper.toPrismaCreateInput(input);

        const raw = await prisma.party.create({
            data, include: { auth: true }
        });

        return AuthMapper.toDomain(raw.auth!);
    }

    async updateLastLoginAt(partyId: number, date: Date) {
        await prisma.auth.update({
            where: { partyId },
            data: { lastLoginAt: date },
        });
    }
}