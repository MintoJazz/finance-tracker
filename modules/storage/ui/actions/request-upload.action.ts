"use server";

import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { failure, Result } from "@/types/result.types";
import {
  RequestUploadInput,
} from "../../core/schemas/attachment.schema";
import { RequestUploadResult } from "../../core/use-cases/request-upload.use-case";
import { StorageFactory } from "../../infra/factories/storage.factory";

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
