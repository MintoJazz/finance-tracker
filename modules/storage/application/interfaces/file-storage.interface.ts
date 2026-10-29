export interface CreateUploadUrlParams {
  key: string;
  mimeType: string;
  size: number;
  expiresInSec?: number;
}

export interface StorageObjectMetadata {
  size: number;
  mimeType: string;
}

export interface IFileStorage {
  createUploadUrl(params: CreateUploadUrlParams): Promise<string>;
  head(key: string): Promise<StorageObjectMetadata | null>;
  createDownloadUrl(key: string, expiresInSec?: number): Promise<string>;
  delete(key: string): Promise<void>;
}
