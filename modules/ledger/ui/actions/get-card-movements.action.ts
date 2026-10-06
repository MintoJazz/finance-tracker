"use server";

import { Page } from "@/types/pagination.types";
import { failure, Result } from "@/types/result.types";
import {
    GetWalletMovementsDTO,
    GetWalletMovementsDTOSchema,
    WalletMovement,
} from "../../core/schemas/wallet-movement.schema";
import { CardMovementMockService } from "../../infra/mock/card-movement.mock";

export async function getCardMovementsAction(
    dto: GetWalletMovementsDTO
): Promise<Result<Page<WalletMovement>>> {
    const parsed = GetWalletMovementsDTOSchema.safeParse(dto);
    if (!parsed.success) {
        return failure(
            parsed.error.issues[0]?.message ??
                "Parâmetros de busca da fatura inválidos"
        );
    }

    // Fase mockada: delega ao serviço de mock de cartões
    return CardMovementMockService.getMovements(parsed.data);
}