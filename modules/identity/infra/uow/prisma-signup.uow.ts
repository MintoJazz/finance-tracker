import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@/prisma/generated/prisma/client";
import {
  ISignupUnitOfWork,
  SignupUnitOfWorkRepositories,
} from "../../core/types/signup-uow.interface";
import { PrismaPartyRepository } from "../repositories/party-prisma.repository";
import { PrismaAuthRepository } from "../repositories/auth-prisma.repository";
import { PrismaFinancialContextRepository } from "@/modules/space/infra/repositories/financial-context-prisma.repository";

export class PrismaSignupUnitOfWork implements ISignupUnitOfWork {
  constructor(private readonly prismaClient: PrismaClient = prisma) { }

  async run<T>(work: (repos: SignupUnitOfWorkRepositories) => Promise<T>): Promise<T> {
    return this.prismaClient.$transaction(async (tx) => {
      const partyRepo = new PrismaPartyRepository(tx);
      const authRepo = new PrismaAuthRepository(tx);
      const contextRepo = new PrismaFinancialContextRepository(tx);

      return work({ partyRepo, authRepo, contextRepo });
    });
  }
}
