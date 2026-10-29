import { prisma } from "@/lib/prisma";
import { Prisma, PrismaClient } from "@/prisma/generated/prisma/client";
import {
  CreatePartyDTO,
  IPartyRepository,
} from "@/modules/auth/application/interfaces/party-repository.interface";
import { Party } from "@/modules/auth/models/party.schema";
import { Profile } from "@/modules/auth/models/profile.schema";
import { getInitials } from "@/lib/avatar-utils";
import { PartyMapper } from "../mappers/party.mapper";

export class PrismaPartyRepository implements IPartyRepository {
  constructor(
    private readonly prismaClient: PrismaClient | Prisma.TransactionClient = prisma
  ) { }

  async findById(id: number): Promise<Party | null> {
    const raw = await this.prismaClient.party.findUnique({
      where: { id },
    });

    if (!raw) return null;
    return PartyMapper.toDomain(raw);
  }

  async findProfileById(id: number): Promise<Profile | null> {
    const raw = await this.prismaClient.party.findUnique({
      where: { id },
      include: {
        auth: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!raw) return null;

    return {
      id: raw.id,
      name: raw.name,
      email: raw.auth?.email ?? "",
      avatarUrl: raw.avatarUrl,
      initials: getInitials(raw.name),
    };
  }

  async findByDocumentNumber(documentNumber: string): Promise<Party | null> {
    const raw = await this.prismaClient.party.findUnique({
      where: { documentNumber },
    });

    if (!raw) return null;
    return PartyMapper.toDomain(raw);
  }

  async create(data: CreatePartyDTO): Promise<Party> {
    const raw = await this.prismaClient.party.create({
      data: {
        name: data.name,
        documentNumber: data.documentNumber,
        birthDate: data.birthDate,
        phone: data.phone,
      },
    });

    return PartyMapper.toDomain(raw);
  }

  async updateAvatar(partyId: number, avatarUrl: string): Promise<void> {
    await this.prismaClient.party.update({
      where: { id: partyId },
      data: { avatarUrl },
    });
  }
}
