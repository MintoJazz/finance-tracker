import { failure, success, Result } from "@/types/result.types";
import { ISpaceAccessProvider } from "../types/space-access-provider.interface";
import {
  RequestUploadInput,
  RequestUploadSchema,
} from "../schemas/attachment.schema";
import {
  MIME_TO_EXTENSION,
  SessionContext,
  UPLOAD_POLICIES,
} from "../policies/upload-policies";
import { IAttachmentRepository } from "../types/attachment-repository.interface";
import { IFileStorage } from "../types/file-storage.interface";

export interface RequestUploadUseCaseDTO {
  session: SessionContext;
  input: RequestUploadInput;
}

export interface RequestUploadResult {
  attachmentId: string;
  uploadUrl: string;
}

export class RequestUploadUseCase {
  constructor(
    private readonly attachmentRepository: IAttachmentRepository,
    private readonly fileStorage: IFileStorage,
    private readonly getSpaceAccess: ISpaceAccessProvider
  ) {}

  async execute({
    session,
    input,
  }: RequestUploadUseCaseDTO): Promise<Result<RequestUploadResult>> {
    try {
      const parsed = RequestUploadSchema.safeParse(input);
      if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message || "Dados de upload inválidos");
      }

      const { mimeType, size, purpose } = parsed.data;
      const policy = UPLOAD_POLICIES[purpose];

      if (!policy.allowedMimeTypes.includes(mimeType)) {
        return failure("Tipo de arquivo não permitido");
      }
      if (size > policy.maxSize) {
        return failure("Tamanho do arquivo excede o limite permitido");
      }

      if (policy.requiresContextAccess) {
        if (!session.contextId) {
          return failure("Contexto financeiro não especificado");
        }

        const access = await this.getSpaceAccess.execute({
          contextId: session.contextId,
          partyId: session.partyId,
        });
        if (!access.success) {
          console.warn(
            `[RequestUploadUseCase] Acesso negado ao contexto ${session.contextId} para party ${session.partyId}: ${access.error}`
          );
          return failure(access.error ?? "Sem acesso a este contexto");
        }

        if (policy.requiredPermission) {
          // Cast porque as permissões vêm tipadas pelo use case do space.
          const permissions = access.data as unknown as Record<string, boolean>;
          if (!permissions[policy.requiredPermission]) {
            return failure("Sem permissão para anexar arquivos neste contexto");
          }
        }
      }

      const attachmentId = crypto.randomUUID();
      const extension = MIME_TO_EXTENSION[mimeType];
      const key = `${policy.keyPrefix(session, attachmentId)}/${attachmentId}.${extension}`;

      await this.attachmentRepository.createPending({
        id: attachmentId,
        key,
        purpose,
        mimeType,
        size,
        ownerPartyId: session.partyId,
        // Só grava contexto quando a finalidade pertence a um contexto.
        contextId: policy.requiresContextAccess ? (session.contextId ?? null) : null,
      });

      const uploadUrl = await this.fileStorage.createUploadUrl({
        key,
        mimeType,
        size,
        expiresInSec: 300,
      });

      return success({ attachmentId, uploadUrl });
    } catch (error) {
      console.error("[RequestUploadUseCase] Erro inesperado:", error);
      return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
    }
  }
}