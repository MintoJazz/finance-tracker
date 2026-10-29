import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  CreateUploadUrlParams,
  IFileStorage,
  StorageObjectMetadata,
} from "@/modules/storage/application/interfaces/file-storage.interface";

export class S3FileStorage implements IFileStorage {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor() {
    const region = process.env.S3_REGION || "us-east-1";
    const endpoint = process.env.S3_ENDPOINT || undefined;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || "";
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || "";
    this.bucket = process.env.S3_BUCKET || "finance-tracker";

    this.s3 = new S3Client({
      region,
      endpoint,
      forcePathStyle: Boolean(endpoint),
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    });
  }

  async createUploadUrl({
    key,
    mimeType,
    size,
    expiresInSec = 300,
  }: CreateUploadUrlParams): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
      ContentLength: size,
    });

    return await getSignedUrl(this.s3, command, {
      expiresIn: expiresInSec,
    });
  }

  async head(key: string): Promise<StorageObjectMetadata | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3.send(command);

      return {
        size: response.ContentLength ?? 0,
        mimeType: response.ContentType ?? "",
      };
    } catch (error: unknown) {
      const s3Error = error as {
        name?: string;
        $metadata?: { httpStatusCode?: number };
      };
      if (
        s3Error.name === "NotFound" ||
        s3Error.name === "NoSuchKey" ||
        s3Error.$metadata?.httpStatusCode === 404
      ) {
        return null;
      }
      throw error;
    }
  }

  async createDownloadUrl(
    key: string,
    expiresInSec = 3600
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3, command, {
      expiresIn: expiresInSec,
    });
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3.send(command);
  }
}
