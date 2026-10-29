import { GetSpaceAccessUseCase } from "@/modules/space/application/use-cases/get-acess.use-case"
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface"
import { GetContextWalletsUseCase } from "../../application/use-cases/get-context-wallets.use-case"
import { CreateWalletUseCase } from "../../application/use-cases/create-wallet.use-case"
import { UpdateWalletUseCase } from "../../application/use-cases/update-wallet.use-case"
import { ArchiveWalletUseCase } from "../../application/use-cases/archive-wallet.use-case"
import { RestoreWalletUseCase } from "../../application/use-cases/restore-wallet.use-case"
import { GetWalletByIdUseCase } from "../../application/use-cases/get-wallet-by-id.use-case"
import { GetWalletProfileUseCase } from "../../application/use-cases/get-wallet-profile.use-case"
import { WalletPrismaQueries } from "../repositories/wallet-prisma.queries"
import { WalletPrismaRepository } from "../repositories/wallet-prisma.repository"
import { IWalletQueries } from "../../application/interfaces/wallet-queries.interface"
import { IWalletRepository } from "../../application/interfaces/wallet-repository.interface"
import { IContextMemberRepository } from "@/modules/space/application/interfaces/context-member-repository.interface"
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository"

export class WalletFactory {
  private static readonly walletQueries: IWalletQueries =
    new WalletPrismaQueries()
  private static readonly walletRepository: IWalletRepository =
    new WalletPrismaRepository()
  private static readonly memberRepository: IContextMemberRepository =
    new PrismaContextMembersRepository()

  private static readonly spaceAccessProvider: ISpaceAccessProvider =
    new GetSpaceAccessUseCase(this.memberRepository)

  public static readonly makeGetContextWalletsUseCase = () =>
    new GetContextWalletsUseCase(this.walletQueries, this.spaceAccessProvider)
  public static readonly makeCreateWalletUseCase = () =>
    new CreateWalletUseCase(this.walletRepository, this.spaceAccessProvider)
  public static readonly makeUpdateWalletUseCase = () =>
    new UpdateWalletUseCase(this.walletRepository, this.spaceAccessProvider)
  public static readonly makeArchiveWalletUseCase = () =>
    new ArchiveWalletUseCase(this.walletRepository, this.spaceAccessProvider)
  public static readonly makeRestoreWalletUseCase = () =>
    new RestoreWalletUseCase(this.walletRepository, this.spaceAccessProvider)
  public static readonly makeGetWalletByIdUseCase = () =>
    new GetWalletByIdUseCase(this.walletQueries, this.spaceAccessProvider)
  public static readonly makeGetWalletProfileUseCase = () =>
    new GetWalletProfileUseCase(this.walletQueries, this.spaceAccessProvider)
}

