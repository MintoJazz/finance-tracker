import type { ICategoryRepository } from "@/modules/categories/application/interfaces/category-repository.interface";
import type { IInstallmentRepository } from "./installment-repository.interface";

export interface InstallmentUnitOfWorkRepositories {
    categoryRepo: ICategoryRepository;
    installmentRepo: IInstallmentRepository;
}

/**
 * Unidade de trabalho da criação de parcelamento: todos os repositórios recebidos
 * em `work` compartilham a mesma transação (tudo é confirmado ou tudo é desfeito).
 */
export interface IInstallmentUnitOfWork {
    run<T>(work: (repos: InstallmentUnitOfWorkRepositories) => Promise<T>): Promise<T>;
}
