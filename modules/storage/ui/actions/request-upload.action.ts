"use server";

import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { failure, Result } from "@/types/result.types";
import {
  RequestUploadInput,
} from "@/modules/storage/models/attachment.schema";
import { RequestUploadResult } from "@/modules/storage/application/use-cases/request-upload.use-case";
import { StorageFactory } from "@/modules/storage/infra/factories/storage.factory";

export async function requestUploadAction(
  input: RequestUploadInput
): Promise<Result<RequestUploadResult>> {
  const session = await SessionHandler.getSession();
  if (!session) {
    return failure("Não autenticado");
  }

  const useCase = StorageFactory.makeRequestUpload();
  return await useCase.execute({ session, input });
}
