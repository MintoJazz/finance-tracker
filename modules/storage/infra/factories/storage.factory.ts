import { GetSpaceAccessUseCase } from "@/modules/space/application/use-cases/get-acess.use-case";
import { ISpaceAccessProvider } from "@/modules/storage/application/interfaces/space-access-provider.interface";
import { IContextMemberRepository } from "@/modules/space/application/interfaces/context-member-repository.interface";
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository";
import { IAttachmentRepository } from "@/modules/storage/application/interfaces/attachment-repository.interface";
import { IFileStorage } from "@/modules/storage/application/interfaces/file-storage.interface";
import { RequestUploadUseCase } from "@/modules/storage/application/use-cases/request-upload.use-case";
import { ConfirmUploadUseCase } from "@/modules/storage/application/use-cases/confirm-upload.use-case";
import { CleanupStaleUploadsUseCase } from "@/modules/storage/application/use-cases/cleanup-stale-uploads.use-case";
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
