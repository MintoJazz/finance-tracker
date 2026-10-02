import { prisma } from "@/lib/prisma";
import { Prisma, PrismaClient } from "@/prisma/generated/prisma/client";
import { AuthMapper } from "../mappers/auth.mapper";
import {
  CreateAuthDTO,
  IAuthRepository,
} from "../../core/types/auth-repository.interface";
import { Auth } from "../../core/schemas/auth.schema";

export class PrismaAuthRepository implements IAuthRepository {
  constructor(
    private readonly prismaClient: PrismaClient | Prisma.TransactionClient = prisma
  ) { }

  async findByEmail(email: string): Promise<Auth | null> {
    const raw = await this.prismaClient.auth.findUnique({
      where: { email },
    });

    if (!raw) return null;
    return AuthMapper.toDomain(raw);
  }

  async create(data: CreateAuthDTO): Promise<Auth> {
    const raw = await this.prismaClient.auth.create({
      data: {
        partyId: data.partyId,
        email: data.email,
        password: data.passwordHash,
      },
    });

    return AuthMapper.toDomain(raw);
  }

  async updateLastLoginAt(partyId: number, date: Date): Promise<void> {
    await this.prismaClient.auth.update({
      where: { partyId },
      data: { lastLoginAt: date },
    });
  }
}
