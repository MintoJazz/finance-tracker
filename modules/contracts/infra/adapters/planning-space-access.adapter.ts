import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import { GetSpaceAccessUseCase } from "@/modules/space/application/use-cases/get-acess.use-case";
import { failure, Result, success } from "@/types/result.types";
import {
    IPlanningAccessProvider,
    PlanningAccessPermissions,
} from "@/modules/space/application/interfaces/planning-access-provider.interface";

export class PlanningSpaceAccessAdapter implements IPlanningAccessProvider {
    constructor(private readonly getSpaceAccess: GetSpaceAccessUseCase) {}

    async execute(
        session: SessionPayload
    ): Promise<Result<PlanningAccessPermissions>> {
        const result = await this.getSpaceAccess.execute({
            contextId: session.contextId,
            partyId: session.partyId,
        });

        if (!result.success || !result.data) {
            return failure(result.error ?? "Acesso negado ao contexto.");
        }

        return success({
            canViewPlanning: result.data.canViewBalances,
            canManagePlanning: result.data.canManageBalances,
        });
    }
}
