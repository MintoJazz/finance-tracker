"use server";

import { Page } from "@/types/pagination.types";
import { failure, Result } from "@/types/result.types";
import {
    CommitmentCycleItem,
    GetCommitmentCyclesDTO,
    GetCommitmentCyclesDTOSchema,
} from "../../core/schemas/commitment-cycle.schema";
import { CommitmentCycleMockService } from "../../infra/mock/commitment-cycle.mock";

export async function getCommitmentCyclesAction(
    dto: GetCommitmentCyclesDTO
): Promise<Result<Page<CommitmentCycleItem>>> {
    const parsed = GetCommitmentCyclesDTOSchema.safeParse(dto);
    if (!parsed.success) {
        return failure(
            parsed.error.issues[0]?.message ??
                "Parâmetros de filtro dos compromissos inválidos"
        );
    }

    return CommitmentCycleMockService.getCycles(parsed.data);
}