import { GetSpaceAccessUseCase } from "@/modules/space/core/use-case/get-acess.use-case";
import { IContextMemberRepository } from "@/modules/space/core/types/context-member-repository.interface";
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository";
import { WalletPrismaQueries } from "@/modules/account/infra/repositories/wallet-prisma.queries";
import { GetWalletMovementsUseCase } from "../../core/use-cases/get-wallet-movements.use-case";
import { IMovementQueries } from "../../core/types/movement-queries.interface";
import { ISpaceAccessProvider } from "../../core/types/space-access-provider.interface";
import { IBalanceLookupProvider } from "../../core/types/balance-lookup-provider.interface";
import { MovementPrismaQueries } from "../repositories/movement-prisma.queries";

export class LedgerFactory {
    private static readonly movementQueries: IMovementQueries =
        new MovementPrismaQueries();
    private static readonly memberRepository: IContextMemberRepository =
        new PrismaContextMembersRepository();
    private static readonly spaceAccessProvider: ISpaceAccessProvider =
        new GetSpaceAccessUseCase(this.memberRepository);
    private static readonly balanceLookupProvider: IBalanceLookupProvider =
        new WalletPrismaQueries();

    public static readonly makeGetWalletMovementsUseCase = () =>
        new GetWalletMovementsUseCase(
            this.movementQueries,
            this.spaceAccessProvider,
            this.balanceLookupProvider
        );
}