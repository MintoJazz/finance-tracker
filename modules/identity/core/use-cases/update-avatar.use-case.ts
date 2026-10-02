import { failure, Result, success } from "@/types/result.types";
import { IAttachmentRepository } from "@/modules/storage/core/types/attachment-repository.interface";
import { IFileStorage } from "@/modules/storage/core/types/file-storage.interface";
import { IPartyRepository } from "../types/party-repository.interface";

export interface UpdateAvatarInput {
  partyId: number;
  attachmentId: string;
}

export class UpdateAvatarUseCase {
  constructor(
    private readonly partyRepository: IPartyRepository,
    private readonly attachmentRepository: IAttachmentRepository,
    private readonly fileStorage?: IFileStorage
  ) {}

  async execute(input: UpdateAvatarInput): Promise<Result<{ avatarUrl: string }>> {
    try {
      const { partyId, attachmentId } = input;

      const attachment = await this.attachmentRepository.findById(attachmentId);
      if (!attachment) {
        return failure("Anexo não encontrado");
      }

      if (attachment.ownerPartyId !== partyId) {
        return failure("Sem permissão para utilizar este anexo");
      }

      if (attachment.status !== "CONFIRMED") {
        return failure("O upload da foto ainda não foi confirmado");
      }

      await this.partyRepository.updateAvatar(partyId, attachment.key);

      let avatarUrl = attachment.key;
      if (this.fileStorage) {
        try {
          avatarUrl = await this.fileStorage.createDownloadUrl(attachment.key, 86400);
        } catch {
          // fallback to attachment.key
        }
      }

      return success({ avatarUrl });
    } catch (error) {
      console.error("[UpdateAvatarUseCase] Falha ao atualizar avatar:", error);
      return failure("Erro ao salvar foto de perfil");
    }
  }
}
