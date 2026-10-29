"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, Result } from "@/types/result.types";
import { AuthFactory } from "@/modules/auth/infra/factories/auth.factory";

export async function updateAvatarAction(
  attachmentId: string
): Promise<Result<{ avatarUrl: string }>> {
  const session = await SessionHandler.getSession();
  if (!session) {
    return failure("Não autenticado");
  }

  const useCase = AuthFactory.makeUpdateAvatar();
  return await useCase.execute({
    partyId: session.partyId,
    attachmentId,
  });
}
