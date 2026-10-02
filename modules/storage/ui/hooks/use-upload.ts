"use client";

import { useState, useCallback } from "react";
import { failure, success, Result } from "@/types/result.types";
import { AttachmentPurpose } from "../../core/schemas/attachment.schema";
import { requestUploadAction } from "../actions/request-upload.action";
import { confirmUploadAction } from "../actions/confirm-upload.action";

export async function uploadFile(
  file: File,
  purpose: AttachmentPurpose
): Promise<Result<{ attachmentId: string }>> {
  try {
    // 1. Pedir permissão de upload
    const requestResult = await requestUploadAction({
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      purpose,
    });

    if (!requestResult.success) {
      return failure(requestResult.error);
    }

    const { attachmentId, uploadUrl } = requestResult.data;

    // 2. Upload direto no storage via PUT
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      return failure(
        `Falha ao enviar arquivo para o servidor de armazenamento (${uploadResponse.status} ${uploadResponse.statusText})`
      );
    }

    // 3. Confirmar upload no backend
    const confirmResult = await confirmUploadAction({ attachmentId });
    if (!confirmResult.success) {
      return failure(confirmResult.error);
    }

    return success({ attachmentId: confirmResult.data.attachmentId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado durante o upload";
    return failure(message);
  }
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (
      file: File,
      purpose: AttachmentPurpose
    ): Promise<Result<{ attachmentId: string }>> => {
      setIsUploading(true);
      setError(null);

      try {
        const result = await uploadFile(file, purpose);
        if (!result.success) {
          setError(result.error);
        }
        return result;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  return {
    upload,
    isUploading,
    error,
  };
}
