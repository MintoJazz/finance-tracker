import { Attachment as PrismaAttachment } from "@/prisma/generated/prisma/client";
import { Attachment } from "../../core/schemas/attachment.schema";

export class AttachmentMapper {
  static toDomain(raw: PrismaAttachment): Attachment {
    return {
      id: raw.id,
      key: raw.key,
      purpose: raw.purpose,
      mimeType: raw.mimeType,
      size: raw.size,
      status: raw.status,
      ownerPartyId: raw.ownerPartyId,
      contextId: raw.contextId,
      createdAt: raw.createdAt,
      confirmedAt: raw.confirmedAt,
    };
  }
}
