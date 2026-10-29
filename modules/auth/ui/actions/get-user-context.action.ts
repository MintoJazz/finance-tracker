"use server";

import { UserContextData } from "@/modules/auth/models/user-context.schema";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { AuthFactory } from "@/modules/auth/infra/factories/auth.factory";
import { SpaceFactory } from "@/modules/space/infra/factories/space.factory";
import { failure, success, Result } from "@/types/result.types";

export async function getUserContextAction(): Promise<Result<UserContextData>> {
  const session = await SessionHandler.getSession();
  if (!session) {
    return failure("Não autenticado");
  }

  const getProfileUseCase = AuthFactory.makeGetProfile();
  const getUserContextsUseCase = SpaceFactory.makeGetUserContexts();

  const [profileResult, contextsResult] = await Promise.all([
    getProfileUseCase.execute({ partyId: session.partyId }),
    getUserContextsUseCase.execute({ partyId: session.partyId }),
  ]);

  if (!profileResult.success) {
    return failure(profileResult.error);
  }

  if (!contextsResult.success) {
    return failure(contextsResult.error);
  }

  return success({
    profile: profileResult.data,
    contexts: contextsResult.data,
    activeContextId: session.contextId,
  });
}
