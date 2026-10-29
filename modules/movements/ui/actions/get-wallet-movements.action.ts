"use server";

import { Page } from "@/types/pagination.types";
import { failure, Result } from "@/types/result.types";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import {
    GetWalletMovementsDTO,
    GetWalletMovementsDTOSchema,
    WalletMovement,
} from "@/modules/movements/models/wallet-movement.schema";
import { MovementFactory } from "@/modules/movements/infra/factories/movement.factory";

export async function getWalletMovementsAction(
    dto: GetWalletMovementsDTO
): Promise<Result<Page<WalletMovement>>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = GetWalletMovementsDTOSchema.safeParse(dto);
    if (!parsed.success) {
        return failure(
            parsed.error.issues[0]?.message ??
                "Parâmetros de busca de movimentações inválidos"
        );
    }

    const useCase = MovementFactory.makeGetWalletMovementsUseCase();
    return await useCase.execute({
        session,
        walletId: parsed.data.walletId,
        pageRequest: {
            page: parsed.data.pageRequest.page ?? 1,
            pageSize: parsed.data.pageRequest.pageSize ?? 50,
        },
        filter: parsed.data.filter,
    });
}