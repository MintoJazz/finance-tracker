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

export async function getCardMovementsAction(
    dto: GetWalletMovementsDTO
): Promise<Result<Page<WalletMovement>>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = GetWalletMovementsDTOSchema.safeParse(dto);
    if (!parsed.success) {
        return failure(
            parsed.error.issues[0]?.message ??
                "Parâmetros de busca da fatura inválidos"
        );
    }

    const useCase = LedgerFactory.makeGetWalletMovementsUseCase();
    return await useCase.execute({
        session,
        walletId: parsed.data.walletId,
        pageRequest: {
            page: parsed.data.pageRequest.page ?? 1,
            pageSize: parsed.data.pageRequest.pageSize ?? 10,
        },
        filter: parsed.data.filter,
    });
}