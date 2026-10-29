import { Prisma } from "@/prisma/generated/prisma/client";
import { failure, Result, success } from "@/types/result.types";
import { SignupFormType, SignupSchema } from "@/modules/auth/models/signup.schema";
import { IAuthRepository } from "@/modules/auth/application/interfaces/auth-repository.interface";
import { IPartyRepository } from "@/modules/auth/application/interfaces/party-repository.interface";
import { IPasswordHasher } from "@/modules/auth/application/interfaces/password-hasher.interface";
import { ISignupUnitOfWork } from "@/modules/auth/application/interfaces/signup-uow.interface";

export interface SignupResultData {
  partyId: number;
  contextId: number;
  name: string;
  email: string;
}

export class SignupUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly partyRepository: IPartyRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly uow: ISignupUnitOfWork
  ) {}

  async execute(formData: SignupFormType): Promise<Result<SignupResultData>> {
    const { data, success: parseSuccess, error } = SignupSchema.safeParse(formData);
    if (!parseSuccess) return failure(error.issues[0].message);

    try {
      // 1. Checagens de UX rápidas (fora da transação)
      const existingAuth = await this.authRepository.findByEmail(data.email);
      if (existingAuth) {
        return failure("E-mail já cadastrado");
      }

      const existingParty = await this.partyRepository.findByDocumentNumber(data.documentNumber);
      if (existingParty) {
        return failure("CPF já cadastrado");
      }

      // 2. Hash da senha (executado fora da transação para economizar recursos)
      const passwordHash = await this.passwordHasher.hash(data.password);

      // 3. Execução da transação atômica via Unit of Work
      const result = await this.uow.run(async ({ partyRepo, authRepo, contextRepo }) => {
        const party = await partyRepo.create({
          name: data.name,
          documentNumber: data.documentNumber,
          birthDate: data.birthDate,
          phone: data.phone,
        });

        const auth = await authRepo.create({
          partyId: party.id,
          email: data.email,
          passwordHash,
        });

        const context = await contextRepo.createContextWithOwner({
          name: `Espaço de ${data.name}`,
          ownerPartyId: party.id,
        });

        return {
          partyId: party.id,
          contextId: context.id,
          name: party.name,
          email: auth.email,
        };
      });

      return success(result);
    } catch (error) {
      // 4. Captura de race conditions / erros de chave única no banco
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("email")) {
          return failure("E-mail já cadastrado");
        }
        if (target.includes("documentNumber")) {
          return failure("CPF já cadastrado");
        }
        return failure("Registro duplicado encontrado");
      }

      console.error("[SignupUseCase] Falha crítica ao cadastrar usuário:", error);
      return failure("Erro ao cadastrar usuário");
    }
  }
}