import { IAuthRepository } from "../types/auth-repository.interface";
import { Auth } from "../schemas/auth.schema";
import { IPasswordHasher } from "../types/password-hasher.interface";
import { failure, Result, success } from "@/types/result";
import { SignupFormType, SignupSchema } from "../schemas/signup.schema";

export class SignupUseCase {
    constructor(
        private readonly authRepository: IAuthRepository,
        private readonly passwordHasher: IPasswordHasher,
    ) { }

    async execute(formData: SignupFormType): Promise<Result<Auth>> {
        const { data, success: parseSuccess, error } = SignupSchema.safeParse(formData);
        if (!parseSuccess) return failure(error.message);

        try {
            const user = await this.authRepository.findAuthByEmail(data.email);
            if (user) return failure("Usuário já cadastrado");

            const passwordHash = await this.passwordHasher.hash(data.password);
            const { confirmPassword, password, ...createUserDto } = data

            const createdUser = await this.authRepository.create({ ...createUserDto, passwordHash });

            return success(createdUser);
        } catch (error) {
            console.error(error);
            return failure("Erro ao cadastrar usuário");
        }
    }
}