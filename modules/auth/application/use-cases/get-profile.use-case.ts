import { failure, success, Result } from "@/types/result.types";
import { IFileStorage } from "@/modules/storage/application/interfaces/file-storage.interface";
import { Profile } from "@/modules/auth/models/profile.schema";
import { IPartyRepository } from "@/modules/auth/application/interfaces/party-repository.interface";

export interface GetProfileDTO {
  partyId: number;
}

export class GetProfileUseCase {
  constructor(
    private readonly partyRepository: IPartyRepository,
    private readonly fileStorage?: IFileStorage
  ) {}

  async execute({ partyId }: GetProfileDTO): Promise<Result<Profile>> {
    try {
      if (!partyId || partyId <= 0) {
        return failure("Identificador de usuário inválido.");
      }

      const profile = await this.partyRepository.findProfileById(partyId);
      if (!profile) {
        return failure("Perfil de usuário não encontrado.");
      }

      let avatarUrl = profile.avatarUrl;
      if (avatarUrl && this.fileStorage) {
        const isFullUrl =
          avatarUrl.startsWith("http://") ||
          avatarUrl.startsWith("https://") ||
          avatarUrl.startsWith("/");
        if (!isFullUrl) {
          try {
            avatarUrl = await this.fileStorage.createDownloadUrl(avatarUrl, 86400);
          } catch (storageError) {
            console.error("[GetProfileUseCase] Falha ao gerar URL de download do avatar:", storageError);
            avatarUrl = null;
          }
        }
      }

      return success({
        ...profile,
        avatarUrl,
      });
    } catch (error) {
      console.error("[GetProfileUseCase] Falha ao buscar perfil:", error);
      return failure("Ocorreu um erro ao carregar o perfil do usuário.");
    }
  }
}
