import { GetSpaceAccessUseCase } from "@/modules/space/core/use-case/get-acess.use-case";
import { ISpaceAccessProvider } from "@/modules/account/core/types/space-access-provider.interface";
import { GetContextWalletsUseCase } from "../../core/use-cases/get-context-wallets.use-case";
import { GetContextCardsUseCase } from "../../core/use-cases/get-context-cards.use-case";
import { CreateWalletUseCase } from "../../core/use-cases/create-wallet.use-case";
import { UpdateWalletUseCase } from "../../core/use-cases/update-wallet.use-case";
import { ArchiveWalletUseCase } from "../../core/use-cases/archive-wallet.use-case";
import { RestoreWalletUseCase } from "../../core/use-cases/restore-wallet.use-case";
import { GetWalletByIdUseCase } from "../../core/use-cases/get-wallet-by-id.use-case";
import { GetWalletProfileUseCase } from "../../core/use-cases/get-wallet-profile.use-case";
import { CreateCardUseCase } from "../../core/use-cases/create-card.use-case";
import { ArchiveCardUseCase } from "../../core/use-cases/archive-card.use-case";
import { RestoreCardUseCase } from "../../core/use-cases/restore-card.use-case";
import { GetCardByIdUseCase } from "../../core/use-cases/get-card-by-id.use-case";
import { WalletPrismaQueries } from "../repositories/wallet-prisma.queries";
import { WalletPrismaRepository } from "../repositories/wallet-prisma.repository";
import { CardPrismaQueries } from "../repositories/card-prisma.queries";
import { CardPrismaRepository } from "../repositories/card-prisma.repository";
import { IWalletQueries } from "@/modules/account/core/types/wallet-queries.interface";
import { IWalletRepository } from "@/modules/account/core/types/wallet-repository.interface";
import { ICardQueries } from "@/modules/account/core/types/card-queries.interface";
import { ICardRepository } from "@/modules/account/core/types/card-repository.interface";
import { IContextMemberRepository } from "@/modules/space/core/types/context-member-repository.interface";
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository";

export class AccountFactory {
    private static readonly walletQueries: IWalletQueries = new WalletPrismaQueries();
    private static readonly walletRepository: IWalletRepository = new WalletPrismaRepository();
    private static readonly cardQueries: ICardQueries = new CardPrismaQueries();
    private static readonly cardRepository: ICardRepository = new CardPrismaRepository();
    private static readonly memberRepository: IContextMemberRepository = new PrismaContextMembersRepository();

    private static readonly spaceAccessProvider: ISpaceAccessProvider = new GetSpaceAccessUseCase(this.memberRepository);

    // Wallets
    public static readonly makeGetContextWalletsUseCase = () =>
        new GetContextWalletsUseCase(this.walletQueries, this.spaceAccessProvider);
    public static readonly makeCreateWalletUseCase = () =>
        new CreateWalletUseCase(this.walletRepository, this.spaceAccessProvider);
    public static readonly makeUpdateWalletUseCase = () =>
        new UpdateWalletUseCase(this.walletRepository, this.spaceAccessProvider);
    public static readonly makeArchiveWalletUseCase = () =>
        new ArchiveWalletUseCase(this.walletRepository, this.spaceAccessProvider);
    public static readonly makeRestoreWalletUseCase = () =>
        new RestoreWalletUseCase(this.walletRepository, this.spaceAccessProvider);
    public static readonly makeGetWalletByIdUseCase = () =>
        new GetWalletByIdUseCase(this.walletQueries, this.spaceAccessProvider);
    public static readonly makeGetWalletProfileUseCase = () =>
        new GetWalletProfileUseCase(this.walletQueries, this.spaceAccessProvider);

    // Cards
    public static readonly makeGetContextCardsUseCase = () =>
        new GetContextCardsUseCase(this.cardQueries, this.spaceAccessProvider);
    public static readonly makeCreateCardUseCase = () =>
        new CreateCardUseCase(this.cardRepository, this.spaceAccessProvider);
    public static readonly makeArchiveCardUseCase = () =>
        new ArchiveCardUseCase(this.cardRepository, this.spaceAccessProvider);
    public static readonly makeRestoreCardUseCase = () =>
        new RestoreCardUseCase(this.cardRepository, this.spaceAccessProvider);
    public static readonly makeGetCardByIdUseCase = () =>
        new GetCardByIdUseCase(this.cardQueries, this.spaceAccessProvider);
}