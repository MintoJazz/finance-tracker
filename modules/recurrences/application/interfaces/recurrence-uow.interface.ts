import type { ICategoryRepository } from "@/modules/categories/application/interfaces/category-repository.interface";
import type { IRecurrenceRepository } from "./recurrence-repository.interface";

export interface RecurrenceUnitOfWorkRepositories {
    categoryRepo: ICategoryRepository;
    recurrenceRepo: IRecurrenceRepository;
}

/**
 * Unidade de trabalho da criação de recorrência: todos os repositórios recebidos
 * em `work` compartilham a mesma transação (tudo é confirmado ou tudo é desfeito).
 */
export interface IRecurrenceUnitOfWork {
    run<T>(work: (repos: RecurrenceUnitOfWorkRepositories) => Promise<T>): Promise<T>;
}
