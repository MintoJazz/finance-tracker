import { GetSpaceAccessUseCase } from "@/modules/space/core/use-case/get-acess.use-case";
import { GetContextWalletsUseCase } from "../../core/use-cases/get-context-wallets.use-case";
import { GetContextCardsUseCase } from "../../core/use-cases/get-context-cards.use-case";
import { WalletPrismaQueries } from "../repositories/wallet-prisma.queries";
import { CardPrismaQueries } from "../repositories/card-prisma.queries";
import { IWalletQueries } from "@/modules/account/core/types/wallet-queries.interface";
import { ICardQueries } from "@/modules/account/core/types/card-queries.interface";
import { IContextMemberRepository } from "@/modules/space/core/types/context-member-repository.interface";
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository";

export class AccountFactory {
    private static readonly walletQueries: IWalletQueries = new WalletPrismaQueries();
    private static readonly cardQueries: ICardQueries = new CardPrismaQueries();
    private static readonly memberRepository: IContextMemberRepository = new PrismaContextMembersRepository();
    private static readonly getSpaceAccessUseCase = new GetSpaceAccessUseCase(this.memberRepository);

    public static readonly makeGetContextWalletsUseCase = () =>
        new GetContextWalletsUseCase(this.walletQueries, this.getSpaceAccessUseCase);

    public static readonly makeGetContextCardsUseCase = () =>
        new GetContextCardsUseCase(this.cardQueries, this.getSpaceAccessUseCase);
}