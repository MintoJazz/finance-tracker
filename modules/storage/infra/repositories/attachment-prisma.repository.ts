import { prisma } from "@/lib/prisma";
import { Prisma, PrismaClient } from "@/prisma/generated/prisma/client";
import { CreatePendingAttachmentDTO, IAttachmentRepository } from "@/modules/storage/application/interfaces/attachment-repository.interface";
import { Attachment } from "@/modules/storage/models/attachment.schema";
import { AttachmentMapper } from "../mappers/attachment.mapper";


export class PrismaAttachmentRepository implements IAttachmentRepository {
  constructor(
    private readonly db: PrismaClient | Prisma.TransactionClient = prisma
  ) { }

  async createPending(data: CreatePendingAttachmentDTO): Promise<Attachment> {
    const raw = await this.db.attachment.create({
      data: {
        id: data.id,
        key: data.key,
        purpose: data.purpose,
        mimeType: data.mimeType,
        size: data.size,
        status: "PENDING",
        ownerPartyId: data.ownerPartyId,
        contextId: data.contextId ?? null,
      },
    });

    return AttachmentMapper.toDomain(raw);
  }

  async findById(id: string): Promise<Attachment | null> {
    const raw = await this.db.attachment.findUnique({
      where: { id },
    });

    if (!raw) return null;
    return AttachmentMapper.toDomain(raw);
  }

  async markConfirmed(id: string, confirmedAt?: Date): Promise<Attachment> {
    const raw = await this.db.attachment.update({
      where: { id },
      data: {
        status: "CONFIRMED",
        confirmedAt: confirmedAt ?? new Date(),
      },
    });

    return AttachmentMapper.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.db.attachment.delete({
      where: { id },
    });
  }

  async findStalePending(olderThan: Date): Promise<Attachment[]> {
    const records = await this.db.attachment.findMany({
      where: {
        status: "PENDING",
        createdAt: {
          lte: olderThan,
        },
      },
    });

    return records.map(AttachmentMapper.toDomain);
  }
}
