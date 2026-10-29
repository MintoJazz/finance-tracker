import { failure, success } from "@/types/result.types";
import { LoginSchema, LoginFormType } from "@/modules/auth/models/login.schema";
import { IAuthRepository } from "@/modules/auth/application/interfaces/auth-repository.interface";
import { IPasswordHasher } from "@/modules/auth/application/interfaces/password-hasher.interface";
import { IFinancialContextRepository } from "@/modules/space/application/interfaces/financial-context-repository.interface";

export class LoginUseCase {
    constructor(
        private readonly authRepo: IAuthRepository,
        private readonly hasher: IPasswordHasher,
        private readonly contextRepo: IFinancialContextRepository
    ) { }

    async execute(input: LoginFormType) {
        const { data, success: parseSuccess, error } = LoginSchema.safeParse(input);
        if (!parseSuccess) return failure(error.issues[0].message);

        try {
            const auth = await this.authRepo.findByEmail(data.email);
            if (!auth) return failure("E-mail ou senha inválidos.");
            const { partyId, email, password } = auth;

            const senhaValida = await this.hasher.compare(data.password, password);
            if (!senhaValida) return failure("E-mail ou senha inválidos.");

            await this.authRepo.updateLastLoginAt(partyId, new Date());

            const defaultContext = await this.contextRepo.findDefaultByParty(partyId);
            const contextId = defaultContext?.contextId ?? partyId;

            return success({ partyId, email, contextId });
        } catch (error) {
            console.error("[LoginUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}