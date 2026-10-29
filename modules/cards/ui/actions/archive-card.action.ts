"use server";

import {
    ArchiveCardSchema,
    ArchiveCardInput,
} from "@/modules/cards/models/card.schema";
import { failure, Result } from "@/types/result.types";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { CardFactory } from "@/modules/cards/infra/factories/card.factory";
import { revalidatePath } from "next/cache";

export interface ArchiveCardActionResult {
    id: number;
    name: string;
}

export async function archiveCardAction(
    input: ArchiveCardInput
): Promise<Result<ArchiveCardActionResult>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = ArchiveCardSchema.safeParse(input);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const useCase = CardFactory.makeArchiveCardUseCase();
    const result = await useCase.execute({ session, data: parsed.data });

    if (result.success) {
        revalidatePath("/cards", "layout");
    }

    return result;
}