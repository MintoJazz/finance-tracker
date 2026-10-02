"use server";

import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { failure, Result } from "@/types/result.types";
import {
  ConfirmUploadInput,
} from "../../core/schemas/attachment.schema";
import { ConfirmUploadResult } from "../../core/use-cases/confirm-upload.use-case";
import { StorageFactory } from "../../infra/factories/storage.factory";

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
