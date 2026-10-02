import { z } from "zod";

export const AttachmentPurposeSchema = z.enum(["AVATAR", "ENTRY_RECEIPT"]);
export type AttachmentPurpose = z.infer<typeof AttachmentPurposeSchema>;

export const AttachmentStatusSchema = z.enum(["PENDING", "CONFIRMED"]);
export type AttachmentStatus = z.infer<typeof AttachmentStatusSchema>;

export const RequestUploadSchema = z.object({
  name: z.string().min(1, "O nome do arquivo é obrigatório"),
  mimeType: z.string().min(1, "O tipo MIME é obrigatório"),
  size: z.number().int().positive("O tamanho do arquivo deve ser positivo"),
  purpose: AttachmentPurposeSchema,
});
export type RequestUploadInput = z.infer<typeof RequestUploadSchema>;

export const ConfirmUploadSchema = z.object({
  attachmentId: z.string().uuid("ID de anexo inválido"),
});
export type ConfirmUploadInput = z.infer<typeof ConfirmUploadSchema>;

export const AttachmentSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  purpose: AttachmentPurposeSchema,
  mimeType: z.string(),
  size: z.number().int().nonnegative(),
  status: AttachmentStatusSchema,
  ownerPartyId: z.number().int(),
  contextId: z.number().int().nullable().optional(),
  createdAt: z.coerce.date(),
  confirmedAt: z.coerce.date().nullable().optional(),
});
export type Attachment = z.infer<typeof AttachmentSchema>;
