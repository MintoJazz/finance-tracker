"use server";

import { failure, Result } from "@/types/result.types";
import {
    CommitmentsPeriodSummary,
    GetCommitmentsSummaryDTO,
    GetCommitmentsSummaryDTOSchema,
} from "../../core/schemas/commitment-cycle.schema";
import { CommitmentCycleMockService } from "../../infra/mock/commitment-cycle.mock";

export async function getCommitmentsSummaryAction(
    dto: GetCommitmentsSummaryDTO
): Promise<Result<CommitmentsPeriodSummary>> {
    const parsed = GetCommitmentsSummaryDTOSchema.safeParse(dto);
    if (!parsed.success) {
        return failure(
            parsed.error.issues[0]?.message ??
                "Parâmetros de resumo dos compromissos inválidos"
        );
    }

    return CommitmentCycleMockService.getSummary(parsed.data);
}