"use server";

import { failure, Result } from "@/types/result.types";
import {
    CardProfile,
    GetCardProfileSchema,
} from "../../core/schemas/card-profile.schema";
import { CardProfileMockService } from "../../infra/mock/card-profile.mock";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";

export async function getCardProfileAction(
    id: number
): Promise<Result<CardProfile>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = GetCardProfileSchema.safeParse({ id });
    if (!parsed.success) {
        return failure(
            parsed.error.issues[0]?.message ?? "Identificador do cartão inválido"
        );
    }

    // Fase mockada: delega ao serviço de mock (com guarda de sessão ativa)
    return CardProfileMockService.getProfileById(parsed.data.id);
}