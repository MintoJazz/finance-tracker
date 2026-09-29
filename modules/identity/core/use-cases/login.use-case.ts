import { failure, success } from "@/types/result";
import { LoginSchema, LoginFormType } from "../schemas/login.schema";
import { IAuthRepository } from "../types/auth-repository.interface";
import { IPasswordHasher } from "../types/password-hasher.interface";

export class LoginUseCase {
    constructor(
        private readonly authRepo: IAuthRepository,
        private readonly hasher: IPasswordHasher
    ) { }

    async execute(input: LoginFormType) {
        const { data, success: parseSuccess, error } = LoginSchema.safeParse(input);
        if (!parseSuccess) return failure(error.issues[0].message);

        try {
            const auth = await this.authRepo.findAuthByEmail(data.email);
            if (!auth) return failure("E-mail ou senha inválidos.");
            const { partyId, email, password } = auth

            const senhaValida = await this.hasher.compare(data.password, password);
            if (!senhaValida) return failure("E-mail ou senha inválidos.");

            await this.authRepo.updateLastLoginAt(partyId, new Date());

            const { contextId } = await this.authRepo.findDefaultContext(partyId) ?? {}

            return success({ partyId, email, contextId });
        } catch (error) {
            console.error("[LoginUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}