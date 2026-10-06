"use server";

import { Page } from "@/types/pagination.types";
import { failure, Result } from "@/types/result.types";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import {
    GetWalletMovementsDTO,
    GetWalletMovementsDTOSchema,
    WalletMovement,
} from "../../core/schemas/wallet-movement.schema";
import { LedgerFactory } from "../../infra/factories/ledger.factory";

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

    const useCase = LedgerFactory.makeGetWalletMovementsUseCase();
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