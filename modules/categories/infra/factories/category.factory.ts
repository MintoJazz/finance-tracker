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
import { UpdateCategoryUseCase } from "../../application/use-cases/update-category.use-case";
import { GetCategoryBasicInfoUseCase } from "../../application/use-cases/get-category-basic-info.use-case";
import { GetArchivedCategoriesUseCase } from "../../application/use-cases/get-archived-categories.use-case";
import { ArchiveCategoryUseCase } from "../../application/use-cases/archive-category.use-case";
import { ArchiveSubcategoryUseCase } from "../../application/use-cases/archive-subcategory.use-case";
import { RestoreCategoryUseCase } from "../../application/use-cases/restore-category.use-case";
import { RestoreSubcategoryUseCase } from "../../application/use-cases/restore-subcategory.use-case";

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

  public static readonly makeUpdateCategoryUseCase = () =>
    new UpdateCategoryUseCase(
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

  public static readonly makeArchiveCategoryUseCase = () =>
    new ArchiveCategoryUseCase(
      this.categoryRepository,
      this.spaceAccessProvider
    );

  public static readonly makeArchiveSubcategoryUseCase = () =>
    new ArchiveSubcategoryUseCase(
      this.categoryRepository,
      this.spaceAccessProvider
    );

  public static readonly makeRestoreCategoryUseCase = () =>
    new RestoreCategoryUseCase(
      this.categoryRepository,
      this.spaceAccessProvider
    );

  public static readonly makeRestoreSubcategoryUseCase = () =>
    new RestoreSubcategoryUseCase(
      this.categoryRepository,
      this.spaceAccessProvider
    );
}
