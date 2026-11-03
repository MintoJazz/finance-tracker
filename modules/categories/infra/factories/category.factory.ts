import { GetSpaceAccessUseCase } from "@/modules/space/application/use-cases/get-acess.use-case";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type { IContextMemberRepository } from "@/modules/space/application/interfaces/context-member-repository.interface";
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository";
import type { ICategoryQueries } from "../../application/interfaces/category-queries.interface";
import type { ICategoryRepository } from "../../application/interfaces/category-repository.interface";
import { CategoryPrismaQueries } from "../repositories/category-prisma.queries";
import { CategoryPrismaRepository } from "../repositories/category-prisma.repository";
import { GetCategoriesTreeUseCase } from "../../application/use-cases/get-categories-tree.use-case";
import { GetCategoryChildrenUseCase } from "../../application/use-cases/get-category-children.use-case";
import { CreateCategoryUseCase } from "../../application/use-cases/create-category.use-case";
import { GetCategoryBasicInfoUseCase } from "../../application/use-cases/get-category-basic-info.use-case";
import { GetArchivedCategoriesUseCase } from "../../application/use-cases/get-archived-categories.use-case";

export class CategoryFactory {
  private static readonly categoryQueries: ICategoryQueries =
    new CategoryPrismaQueries();
  private static readonly categoryRepository: ICategoryRepository =
    new CategoryPrismaRepository();
  private static readonly memberRepository: IContextMemberRepository =
    new PrismaContextMembersRepository();

  private static readonly spaceAccessProvider: ISpaceAccessProvider =
    new GetSpaceAccessUseCase(this.memberRepository);

  public static readonly makeGetCategoriesTreeUseCase = () =>
    new GetCategoriesTreeUseCase(
      this.categoryQueries,
      this.spaceAccessProvider
    );

  public static readonly makeGetCategoryChildrenUseCase = () =>
    new GetCategoryChildrenUseCase(
      this.categoryQueries,
      this.spaceAccessProvider
    );

  public static readonly makeCreateCategoryUseCase = () =>
    new CreateCategoryUseCase(
      this.categoryRepository,
      this.spaceAccessProvider
    );

  public static readonly makeGetCategoryBasicInfoUseCase = () =>
    new GetCategoryBasicInfoUseCase(
      this.categoryQueries,
      this.spaceAccessProvider
    );

  public static readonly makeGetArchivedCategoriesUseCase = () =>
    new GetArchivedCategoriesUseCase(
      this.categoryQueries,
      this.spaceAccessProvider
    );
}

