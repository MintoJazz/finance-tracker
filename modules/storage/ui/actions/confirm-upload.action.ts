"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, Result } from "@/types/result.types";
import {
  ConfirmUploadInput,
} from "@/modules/storage/models/attachment.schema";
import { ConfirmUploadResult } from "@/modules/storage/application/use-cases/confirm-upload.use-case";
import { StorageFactory } from "@/modules/storage/infra/factories/storage.factory";

export async function confirmUploadAction(
  input: ConfirmUploadInput
): Promise<Result<ConfirmUploadResult>> {
  const session = await SessionHandler.getSession();
  if (!session) {
    return failure("Não autenticado");
  }

  const useCase = StorageFactory.makeConfirmUpload();
  return await useCase.execute({ session, input });
}
