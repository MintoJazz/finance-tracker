import { IPartyRepository } from "./party-repository.interface";
import { IAuthRepository } from "./auth-repository.interface";
import { IFinancialContextRepository } from "@/modules/space/application/interfaces/financial-context-repository.interface";

export interface SignupUnitOfWorkRepositories {
  partyRepo: IPartyRepository;
  authRepo: IAuthRepository;
  contextRepo: IFinancialContextRepository;
}

export interface ISignupUnitOfWork {
  run<T>(work: (repos: SignupUnitOfWorkRepositories) => Promise<T>): Promise<T>;
}
