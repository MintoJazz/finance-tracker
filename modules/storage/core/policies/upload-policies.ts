import { AttachmentPurpose } from "../schemas/attachment.schema";

export interface SessionContext {
  partyId: number;
  contextId?: number | null;
}

// AJUSTE para os nomes reais das permissões devolvidas pelo GetSpaceAccessUseCase.
// "canViewBalances" existe hoje; "canEditEntries" é um palpite para lançamentos.
export type SpacePermission = "canViewBalances" | "canEditEntries";

export interface UploadPolicy {
  allowedMimeTypes: string[];
  maxSize: number;
  requiresContextAccess: boolean;
  /** Permissão exigida no contexto (só vale quando requiresContextAccess = true). */
  requiredPermission?: SpacePermission;
  keyPrefix: (session: SessionContext, attachmentId: string) => string;
}

export const MIME_TO_EXTENSION: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export const UPLOAD_POLICIES: Record<AttachmentPurpose, UploadPolicy> = {
  AVATAR: {
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    maxSize: 5 * 1024 * 1024, // 5MB
    requiresContextAccess: false,
    keyPrefix: (session) => `parties/${session.partyId}/avatar`,
  },
  ENTRY_RECEIPT: {
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "application/pdf"],
    maxSize: 10 * 1024 * 1024, // 10MB
    requiresContextAccess: true,
    requiredPermission: "canEditEntries",
    keyPrefix: (session) => `contexts/${session.contextId}/receipts`,
  },
};