import { failure, success, Result } from "@/types/result.types";
import { IAttachmentRepository } from "../types/attachment-repository.interface";
import { IFileStorage } from "../types/file-storage.interface";

export interface CleanupStaleUploadsDTO {
  olderThan?: Date;
}

export interface CleanupStaleUploadsResult {
  cleanedCount: number;
  deletedIds: string[];
  failedIds: string[];
}

const BATCH_SIZE = 20;

export class CleanupStaleUploadsUseCase {
  constructor(
    private readonly attachmentRepository: IAttachmentRepository,
    private readonly fileStorage: IFileStorage
  ) {}

  async execute({
    olderThan,
  }: CleanupStaleUploadsDTO = {}): Promise<Result<CleanupStaleUploadsResult>> {
    try {
      const threshold = olderThan ?? new Date(Date.now() - 60 * 60 * 1000);
      const stale = await this.attachmentRepository.findStalePending(threshold);

      const deletedIds: string[] = [];
      const failedIds: string[] = [];

      for (let i = 0; i < stale.length; i += BATCH_SIZE) {
        const batch = stale.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (attachment) => {
            try {
              await this.fileStorage.delete(attachment.key);
            } catch (storageError) {
              console.warn(
                `[CleanupStaleUploadsUseCase] Falha ao excluir objeto key=${attachment.key}:`,
                storageError
              );
              failedIds.push(attachment.id);
              return;
            }

            try {
              await this.attachmentRepository.delete(attachment.id);
              deletedIds.push(attachment.id);
            } catch (dbError) {
              console.error(
                `[CleanupStaleUploadsUseCase] Falha ao excluir registro id=${attachment.id}:`,
                dbError
              );
              failedIds.push(attachment.id);
            }
          })
        );
      }

      return success({ cleanedCount: deletedIds.length, deletedIds, failedIds });
    } catch (error) {
      console.error("[CleanupStaleUploadsUseCase] Erro inesperado:", error);
      return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
    }
  }
}