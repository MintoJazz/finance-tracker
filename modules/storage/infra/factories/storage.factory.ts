import { GetSpaceAccessUseCase } from "@/modules/space/core/use-case/get-acess.use-case";
import { ISpaceAccessProvider } from "@/modules/storage/core/types/space-access-provider.interface";
import { IContextMemberRepository } from "@/modules/space/core/types/context-member-repository.interface";
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository";
import { IAttachmentRepository } from "../../core/types/attachment-repository.interface";
import { IFileStorage } from "../../core/types/file-storage.interface";
import { RequestUploadUseCase } from "../../core/use-cases/request-upload.use-case";
import { ConfirmUploadUseCase } from "../../core/use-cases/confirm-upload.use-case";
import { CleanupStaleUploadsUseCase } from "../../core/use-cases/cleanup-stale-uploads.use-case";
import { S3FileStorage } from "../storage/s3-file-storage";
import { PrismaAttachmentRepository } from "../repositories/attachment-prisma.repository";

export class StorageFactory {
  private static readonly attachmentRepository: IAttachmentRepository =
    new PrismaAttachmentRepository();
  private static readonly fileStorage: IFileStorage = new S3FileStorage();
  private static readonly memberRepository: IContextMemberRepository =
    new PrismaContextMembersRepository();
  private static readonly spaceAccessProvider: ISpaceAccessProvider = new GetSpaceAccessUseCase(
    this.memberRepository
  );

  public static readonly makeFileStorage = (): IFileStorage => this.fileStorage;

  public static readonly makeRequestUpload = () =>
    new RequestUploadUseCase(
      this.attachmentRepository,
      this.fileStorage,
      this.spaceAccessProvider
    );

  public static readonly makeConfirmUpload = () =>
    new ConfirmUploadUseCase(this.attachmentRepository, this.fileStorage);

  public static readonly makeCleanupStaleUploads = () =>
    new CleanupStaleUploadsUseCase(this.attachmentRepository, this.fileStorage);
}
