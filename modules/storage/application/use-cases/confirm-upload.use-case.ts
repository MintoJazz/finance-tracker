import { failure, success, Result } from "@/types/result.types";
import {
  AttachmentStatus,
  ConfirmUploadInput,
  ConfirmUploadSchema,
} from "@/modules/storage/models/attachment.schema";
import { SessionContext } from "@/modules/storage/application/policies/upload-policies";
import { IAttachmentRepository } from "@/modules/storage/application/interfaces/attachment-repository.interface";
import { IFileStorage } from "@/modules/storage/application/interfaces/file-storage.interface";

export interface ConfirmUploadUseCaseDTO {
  session: SessionContext;
  input: ConfirmUploadInput;
}

export interface ConfirmUploadResult {
  attachmentId: string;
  key: string;
  status: AttachmentStatus;
}

export class ConfirmUploadUseCase {
  constructor(
    private readonly attachmentRepository: IAttachmentRepository,
    private readonly fileStorage: IFileStorage
  ) {}

  async execute({
    session,
    input,
  }: ConfirmUploadUseCaseDTO): Promise<Result<ConfirmUploadResult>> {
    try {
      const parsed = ConfirmUploadSchema.safeParse(input);
      if (!parsed.success) {
        const message =
          parsed.error.issues[0]?.message || "ID de anexo inválido";
        return failure(message);
      }

      const { attachmentId } = parsed.data;
      const attachment = await this.attachmentRepository.findById(attachmentId);

      if (!attachment) {
        return failure("Anexo não encontrado");
      }

      if (attachment.ownerPartyId !== session.partyId) {
        console.warn(
          `[ConfirmUploadUseCase] Tentativa de confirmação não autorizada para anexo ${attachmentId} pelo partyId ${session.partyId}`
        );
        return failure("Sem permissão para confirmar este anexo");
      }

      // Idempotência: se já foi confirmado anteriormente
      if (attachment.status === "CONFIRMED") {
        return success({
          attachmentId: attachment.id,
          key: attachment.key,
          status: "CONFIRMED",
        });
      }

      if (attachment.status !== "PENDING") {
        return failure("Status de anexo inválido para confirmação");
      }

      const headResult = await this.fileStorage.head(attachment.key);
      if (!headResult) {
        return failure("Arquivo não encontrado no storage");
      }

      if (headResult.size !== attachment.size) {
        return failure("Tamanho do arquivo diverge do registro");
      }

      if (headResult.mimeType !== attachment.mimeType) {
        return failure("Tipo do arquivo diverge do registro");
      }

      const confirmed = await this.attachmentRepository.markConfirmed(
        attachment.id
      );

      return success({
        attachmentId: confirmed.id,
        key: confirmed.key,
        status: confirmed.status,
      });
    } catch (error) {
      console.error("[ConfirmUploadUseCase] Erro inesperado:", error);
      return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
    }
  }
}
