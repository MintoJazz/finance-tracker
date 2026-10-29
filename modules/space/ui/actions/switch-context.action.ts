"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { SpaceFactory } from "@/modules/space/infra/factories/space.factory";
import { failure, success, Result } from "@/types/result.types";

export async function switchContextAction(targetContextId: number): Promise<Result<{ contextId: number }>> {
  const session = await SessionHandler.getSession();
  if (!session) {
    return failure("Não autenticado");
  }

  const switchContextUseCase = SpaceFactory.makeSwitchContext();
  const result = await switchContextUseCase.execute({
    partyId: session.partyId,
    targetContextId,
  });

  if (!result.success) {
    return result;
  }

  await SessionHandler.create(session.partyId, targetContextId);
  return success({ contextId: targetContextId });
}
