import { GetSpaceAccessUseCase } from "@/modules/space/application/use-cases/get-acess.use-case";
import { IContextMemberRepository } from "@/modules/space/application/interfaces/context-member-repository.interface";
import { PrismaContextMembersRepository } from "@/modules/space/infra/repositories/context-members-prisma.repository";
import { WalletPrismaQueries } from "@/modules/wallets/infra/repositories/wallet-prisma.queries";
import { GetWalletMovementsUseCase } from "@/modules/movements/application/use-cases/get-wallet-movements.use-case";
import { GetCardMovementsUseCase } from "@/modules/movements/application/use-cases/get-card-movements.use-case";
import { IMovementQueries } from "@/modules/movements/application/interfaces/movement-queries.interface";
import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { IBalanceLookupProvider } from "@/modules/movements/application/interfaces/balance-lookup-provider.interface";
import { MovementPrismaQueries } from "../repositories/movement-prisma.queries";

export class MovementFactory {
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

    public static readonly makeGetCardMovementsUseCase = () =>
        new GetCardMovementsUseCase(
            this.movementQueries,
            this.spaceAccessProvider,
            this.balanceLookupProvider
        );
}
