import { GetSpaceAccessUseCase } from "@/modules/space/application/use-cases/get-acess.use-case"
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface"
import { GetContextCardsUseCase } from "../../application/use-cases/get-context-cards.use-case"
import { CreateCardUseCase } from "../../application/use-cases/create-card.use-case"
import { UpdateCardUseCase } from "../../application/use-cases/update-card.use-case"
import { ArchiveCardUseCase } from "../../application/use-cases/archive-card.use-case"
import { RestoreCardUseCase } from "../../application/use-cases/restore-card.use-case"
import { GetCardByIdUseCase } from "../../application/use-cases/get-card-by-id.use-case"
import { GetCardProfileUseCase } from "../../application/use-cases/get-card-profile.use-case"
import { CardPrismaQueries } from "../repositories/card-prisma.queries"
import { CardPrismaRepository } from "../repositories/card-prisma.repository"
import { ICardQueries } from "../../application/interfaces/card-queries.interface"
import { ICardRepository } from "../../application/interfaces/card-repository.interface"
import { IContextMemberRepository } from "@/modules/space/application/interfaces/context-member-repository.interface"
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository"
import { CycleEngineService } from "@/modules/cycles/application/services/cycle-engine.service"
import { ContractProfilePrismaQueries } from "@/modules/contracts/infra/repositories/contract-profile-prisma.queries"

export class CardFactory {
  private static readonly cardQueries: ICardQueries = new CardPrismaQueries()
  private static readonly cardRepository: ICardRepository =
    new CardPrismaRepository()
  private static readonly memberRepository: IContextMemberRepository =
    new PrismaContextMembersRepository()

  private static readonly spaceAccessProvider: ISpaceAccessProvider =
    new GetSpaceAccessUseCase(this.memberRepository)
  private static readonly cycleEngineService = new CycleEngineService()
  private static readonly contractProfileQueries = new ContractProfilePrismaQueries()

  public static readonly makeGetContextCardsUseCase = () =>
    new GetContextCardsUseCase(this.cardQueries, this.spaceAccessProvider)
  public static readonly makeCreateCardUseCase = () =>
    new CreateCardUseCase(this.cardRepository, this.spaceAccessProvider)
  public static readonly makeUpdateCardUseCase = () =>
    new UpdateCardUseCase(this.cardRepository, this.spaceAccessProvider)
  public static readonly makeArchiveCardUseCase = () =>
    new ArchiveCardUseCase(this.cardRepository, this.spaceAccessProvider)
  public static readonly makeRestoreCardUseCase = () =>
    new RestoreCardUseCase(this.cardRepository, this.spaceAccessProvider)
  public static readonly makeGetCardByIdUseCase = () =>
    new GetCardByIdUseCase(this.cardQueries, this.spaceAccessProvider)
  public static readonly makeGetCardProfileUseCase = () =>
    new GetCardProfileUseCase(
      this.cardQueries,
      this.spaceAccessProvider,
      this.cycleEngineService,
      this.contractProfileQueries
    )
}

