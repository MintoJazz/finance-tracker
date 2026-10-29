import { Attachment, AttachmentPurpose } from "@/modules/storage/models/attachment.schema";

export interface CreatePendingAttachmentDTO {
  id?: string;
  key: string;
  purpose: AttachmentPurpose;
  mimeType: string;
  size: number;
  ownerPartyId: number;
  contextId?: number | null;
}

export interface IAttachmentRepository {
  createPending(data: CreatePendingAttachmentDTO): Promise<Attachment>;
  findById(id: string): Promise<Attachment | null>;
  markConfirmed(id: string, confirmedAt?: Date): Promise<Attachment>;
  delete(id: string): Promise<void>;
  findStalePending(olderThan: Date): Promise<Attachment[]>;
}
