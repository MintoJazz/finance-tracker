import { IAuthRepository } from "../../core/types/auth-repository.interface";
import { IPasswordHasher } from "../../core/types/password-hasher.interface";
import { LoginUseCase } from "../../core/use-cases/login.use-case";
import { BcryptHasher } from "../cryptography/bcrypt-hasher";
import { PrismaAuthRepository } from "../repositories/auth/prisma.repository";

export class IdentityFactory {
    private static readonly passwordHasher: IPasswordHasher = new BcryptHasher()
    private static readonly authRepository: IAuthRepository = new PrismaAuthRepository()

    static makeLogIn() {
        return new LoginUseCase(
            this.authRepository,
            this.passwordHasher
        )
    }
}