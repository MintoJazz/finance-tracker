"use server";

import { failure, Result } from "@/types/result.types";
import {
    CardProfile,
    GetCardProfileSchema,
} from "../../core/schemas/card-profile.schema";
import { CardProfileMockService } from "../../infra/mock/card-profile.mock";

export async function getCardProfileAction(
    id: number
): Promise<Result<CardProfile>> {
    const parsed = GetCardProfileSchema.safeParse({ id });
    if (!parsed.success) {
        return failure(
            parsed.error.issues[0]?.message ?? "Identificador do cartão inválido"
        );
    }

    // Fase mockada: delega ao serviço de mock
    return CardProfileMockService.getProfileById(parsed.data.id);
}