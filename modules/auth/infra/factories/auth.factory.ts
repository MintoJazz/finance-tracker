import { IAuthRepository } from "@/modules/auth/application/interfaces/auth-repository.interface";
import { IPartyRepository } from "@/modules/auth/application/interfaces/party-repository.interface";
import { IPasswordHasher } from "@/modules/auth/application/interfaces/password-hasher.interface";
import { ISignupUnitOfWork } from "@/modules/auth/application/interfaces/signup-uow.interface";
import { GetProfileUseCase } from "@/modules/auth/application/use-cases/get-profile.use-case";
import { LoginUseCase } from "@/modules/auth/application/use-cases/login.use-case";
import { SignupUseCase } from "@/modules/auth/application/use-cases/singup.use-case";
import { UpdateAvatarUseCase } from "@/modules/auth/application/use-cases/update-avatar.use-case";
import { BcryptHasher } from "../cryptography/bcrypt-hasher";
import { PrismaAuthRepository } from "../repositories/auth-prisma.repository";
import { PrismaPartyRepository } from "../repositories/party-prisma.repository";
import { PrismaSignupUnitOfWork } from "../uow/prisma-signup.uow";
import { IFinancialContextRepository } from "@/modules/space/application/interfaces/financial-context-repository.interface";
import { PrismaFinancialContextRepository } from "@/modules/space/infra/repositories/financial-context-prisma.repository";
import { IAttachmentRepository } from "@/modules/storage/application/interfaces/attachment-repository.interface";
import { IFileStorage } from "@/modules/storage/application/interfaces/file-storage.interface";
import { PrismaAttachmentRepository } from "@/modules/storage/infra/repositories/attachment-prisma.repository";
import { StorageFactory } from "@/modules/storage/infra/factories/storage.factory";

export class AuthFactory {
  private static readonly passwordHasher: IPasswordHasher = new BcryptHasher();
  private static readonly authRepository: IAuthRepository = new PrismaAuthRepository();
  private static readonly partyRepository: IPartyRepository = new PrismaPartyRepository();
  private static readonly contextRepository: IFinancialContextRepository =
    new PrismaFinancialContextRepository();
  private static readonly signupUow: ISignupUnitOfWork = new PrismaSignupUnitOfWork();
  private static readonly attachmentRepository: IAttachmentRepository =
    new PrismaAttachmentRepository();
  private static readonly fileStorage: IFileStorage = StorageFactory.makeFileStorage();

  public static readonly makeGetProfile = () =>
    new GetProfileUseCase(this.partyRepository, this.fileStorage);

  public static readonly makeLogIn = () =>
    new LoginUseCase(
      this.authRepository,
      this.passwordHasher,
      this.contextRepository
    );

  public static readonly makeSignUp = () =>
    new SignupUseCase(
      this.authRepository,
      this.partyRepository,
      this.passwordHasher,
      this.signupUow
    );

  public static readonly makeUpdateAvatar = () =>
    new UpdateAvatarUseCase(
      this.partyRepository,
      this.attachmentRepository,
      this.fileStorage
    );
}