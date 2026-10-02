"use server";

import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { failure, Result } from "@/types/result.types";
import { IdentityFactory } from "../../infra/factories/identity.factory";

export async function updateAvatarAction(
  attachmentId: string
): Promise<Result<{ avatarUrl: string }>> {
  const session = await SessionHandler.getSession();
  if (!session) {
    return failure("Não autenticado");
  }

  const useCase = IdentityFactory.makeUpdateAvatar();
  return await useCase.execute({
    partyId: session.partyId,
    attachmentId,
  });
}
