"use server";

import { failure, Result, success } from "@/types/result.types";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import {
    AdjustCyclePayload,
    AdjustCyclePayloadSchema,
    AttachReceiptPayload,
    AttachReceiptPayloadSchema,
    InstallmentCyclePayload,
    InstallmentCyclePayloadSchema,
    PayCyclePayload,
    PayCyclePayloadSchema,
    ReverseEntryPayload,
    ReverseEntryPayloadSchema,
    SkipCyclePayload,
    SkipCyclePayloadSchema,
} from "@/modules/cycles/models/contract-cycle.schema";

export async function payCycleAction(
    payload: PayCyclePayload
): Promise<Result<{ message: string }>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = PayCyclePayloadSchema.safeParse(payload);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados de pagamento inválidos");
    }

    // TODO: Implementar no backend com Prisma / use-case real
    return success({
        message: "Pagamento do ciclo registrado com sucesso (simulação).",
    });
}

export async function installmentCycleAction(
    payload: InstallmentCyclePayload
): Promise<Result<{ message: string }>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = InstallmentCyclePayloadSchema.safeParse(payload);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados de parcelamento inválidos");
    }

    // TODO: Implementar no backend com Prisma / use-case real
    return success({
        message: "Parcelamento do ciclo configurado com sucesso (simulação).",
    });
}

export async function adjustCycleAction(
    payload: AdjustCyclePayload
): Promise<Result<{ message: string }>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = AdjustCyclePayloadSchema.safeParse(payload);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados de ajuste inválidos");
    }

    // TODO: Implementar no backend com Prisma / use-case real
    return success({
        message: "Ajuste de valor do ciclo registrado com sucesso (simulação).",
    });
}

export async function attachReceiptCycleAction(
    payload: AttachReceiptPayload
): Promise<Result<{ message: string }>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = AttachReceiptPayloadSchema.safeParse(payload);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados de anexo inválidos");
    }

    // TODO: Implementar no backend com Prisma / use-case real
    return success({
        message: "Comprovante anexado com sucesso (simulação).",
    });
}

export async function skipCycleAction(
    payload: SkipCyclePayload
): Promise<Result<{ message: string }>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = SkipCyclePayloadSchema.safeParse(payload);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados de cancelamento inválidos");
    }

    // TODO: Implementar no backend com Prisma / use-case real
    return success({
        message: "Previsão do ciclo cancelada com sucesso (simulação).",
    });
}

export async function reverseCycleEntryAction(
    payload: ReverseEntryPayload
): Promise<Result<{ message: string }>> {
    const session = await SessionHandler.getSession();
    if (!session) return failure("Não autenticado");

    const parsed = ReverseEntryPayloadSchema.safeParse(payload);
    if (!parsed.success) {
        return failure(parsed.error.issues[0]?.message ?? "Dados de estorno inválidos");
    }

    // TODO: Implementar no backend com Prisma / use-case real
    return success({
        message: "Lançamento estornado com sucesso (simulação).",
    });
}
