import { prisma } from "@/lib/prisma";
import { Prisma, PrismaClient } from "@/prisma/generated/prisma/client";
import { UserContextOption } from "@/modules/space/models/context.schema";
import {
  CreateContextWithOwnerDTO,
  IFinancialContextRepository,
} from "@/modules/space/application/interfaces/financial-context-repository.interface";

export class PrismaFinancialContextRepository implements IFinancialContextRepository {
  constructor(
    private readonly prismaClient: PrismaClient | Prisma.TransactionClient = prisma
  ) { }

  async createContextWithOwner(
    data: CreateContextWithOwnerDTO
  ): Promise<{ id: number; name: string }> {
    const raw = await this.prismaClient.financialContext.create({
      data: {
        name: data.name,
        members: {
          create: {
            partyId: data.ownerPartyId,
            role: "OWNER",
            status: "ACTIVE",
            joinedAt: new Date(),
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return raw;
  }

  async findDefaultByParty(partyId: number): Promise<{ contextId: number } | null> {
    const raw = await this.prismaClient.contextMember.findFirst({
      where: {
        partyId,
        role: "OWNER",
        status: "ACTIVE",
      },
      select: {
        contextId: true,
      },
    });

    if (!raw) return null;
    return { contextId: raw.contextId };
  }

  async findActiveContextsByParty(partyId: number): Promise<UserContextOption[]> {
    const raw = await this.prismaClient.contextMember.findMany({
      where: {
        partyId,
        status: "ACTIVE",
      },
      include: {
        financialContext: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { role: "asc" },
        { createdAt: "asc" },
      ],
    });

    return raw.map((member) => ({
      id: member.financialContext.id,
      name: member.financialContext.name,
      role: member.role,
      isDefault: member.role === "OWNER",
    }));
  }
}
