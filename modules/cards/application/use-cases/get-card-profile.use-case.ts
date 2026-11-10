import { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { failure, success } from "@/types/result.types";
import { CardProfile, CardCycleStatusEnum } from "../../models/card-profile.schema";
import { ICardQueries } from "../interfaces/card-queries.interface";
import { CycleEngineService } from "@/modules/cycles/application/services/cycle-engine.service";
import { ContractProfilePrismaQueries } from "@/modules/contracts/infra/repositories/contract-profile-prisma.queries";
import { addMonths, endOfMonth, startOfMonth, subMonths } from "date-fns";

export interface GetCardProfileUseCaseDTO {
    session: SessionPayload;
    cardId: number;
    referenceDate?: Date;
}

export class GetCardProfileUseCase {
    constructor(
        private readonly cardQueries: ICardQueries,
        private readonly getSpaceAccess: ISpaceAccessProvider,
        private readonly cycleEngine: CycleEngineService,
        private readonly contractProfileQueries: ContractProfilePrismaQueries
    ) {}

    async execute({ session, cardId, referenceDate }: GetCardProfileUseCaseDTO) {
        try {
            const { success: accessSuccess, data: accessData, error } = await this.getSpaceAccess.execute(session);
            if (!accessSuccess) {
                console.warn(
                    `[GetCardProfileUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error!);
            }

            const { canViewBalances } = accessData;
            if (!canViewBalances) {
                console.warn(
                    `[GetCardProfileUseCase] Permissão canViewBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
                );
                return failure("Sem permissão para visualizar os cartões deste contexto!");
            }

            const contextId = session.contextId;
            const now = referenceDate ? new Date(referenceDate) : new Date();
            const window = {
                from: startOfMonth(subMonths(now, 12)),
                to: endOfMonth(addMonths(now, 12)),
            };

            const rawData = await this.contractProfileQueries.findContractProfileData(contextId, { balanceId: cardId }, window);
            if (!rawData || !rawData.cycleSource) {
                const card = await this.cardQueries.findCardById(cardId, contextId);
                if (!card) {
                    return failure("Cartão não encontrado.");
                }
                return failure("Cartão não encontrado ou sem configuração de fatura.");
            }

            if (rawData.cycleSource.balanceType !== "CREDIT") {
                return failure("Cartão inválido.");
            }

            const engineCycles = this.cycleEngine.projectCycles([rawData.cycleSource], window, now);

            const amountLog = rawData.cycleSource.amountLog ?? [];
            const limit = amountLog.reduce((sum, entry) => sum + (entry.amount > 0 ? entry.amount : 0), 0);
            // total de aumentos líquidos históricos (último valor efetivo)
            const sortedLog = [...amountLog].sort((a, b) => a.effectiveAt.getTime() - b.effectiveAt.getTime());
            let currentLimit = 0;
            for (const entry of sortedLog) {
                if (entry.amount > 0) currentLimit += entry.amount;
                else currentLimit = Math.max(0, currentLimit + entry.amount);
            }
            if (currentLimit === 0 && limit > 0) currentLimit = limit;

            // usado: total líquido devedor (max(0, -netSum)) calculado via agregação no banco
            const usedMap = await this.cardQueries.sumAmountsByBalance([cardId]);
            const usedLimit = usedMap?.get(cardId) ?? 0;
            const availableLimit = Math.max(0, (currentLimit || 0) - usedLimit);

            const currentRule = rawData.agreement.rules.sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime())[0];
            const closingDay = currentRule?.closingDay ?? currentRule?.dueDay ?? 1;
            const dueDay = currentRule?.dueDay ?? 10;

            const cycles = engineCycles
                .filter((c) => c.balanceType === "CREDIT")
                .map((c) => ({
                    label: c.label,
                    from: c.from,
                    to: c.to,
                    closingDate: c.closingDate ?? c.dueDate,
                    dueDate: c.dueDate,
                    status: c.status as CardCycleStatusEnum,
                    invoiceAmount: c.totalAmount ?? 0,
                    paidAmount: c.paidAmount ?? 0,
                }));

            const profile: CardProfile = {
                id: cardId,
                name: rawData.cycleSource.balanceName,
                limit: currentLimit || 0,
                usedLimit,
                availableLimit,
                closingDay,
                dueDay,
                isArchived: rawData.agreement.balance?.removedAt !== null && rawData.agreement.balance?.removedAt !== undefined,
                createdAt: rawData.agreement.createdAt ?? new Date(),
                cycles,
            };

            return success(profile);
        } catch (error) {
            console.error("[GetCardProfileUseCase] Falha crítica:", error);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}
