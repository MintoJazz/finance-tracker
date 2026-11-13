import { isAfter, isBefore, startOfDay } from "date-fns";
import { failure, Result, success } from "@/types/result.types";
import {
    CycleRange,
    CycleRangeSchema,
} from "../../models/cycle-primitives.schema";
import { CycleRuleItem } from "../interfaces/cycle-queries.interface";
import type { CycleWindowBoundaries } from "./cycle-detail-engine.service";

export function parseCivilDate(dateStr: string): Date {
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3 && !parts.some(Number.isNaN)) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date(dateStr);
}

export class CycleDetailValidator {
    /**
     * Validação preliminar do balanceId e formato do range de datas.
     */
    static validateInput(params: {
        balanceId: number;
        range: CycleRange;
    }): Result<{ from: Date; to: Date }> {
        if (!params.balanceId || params.balanceId <= 0) {
            return failure("Identificador de saldo inválido.");
        }

        const parsed = CycleRangeSchema.safeParse(params.range);
        if (!parsed.success) {
            return failure(
                parsed.error.issues[0]?.message ?? "Período de vigência inválido."
            );
        }

        return success({
            from: parseCivilDate(params.range.from),
            to: parseCivilDate(params.range.to),
        });
    }

    /**
     * Validação de existência de regras para o compromisso.
     */
    static validateRulesNotEmpty(rules: CycleRuleItem[]): Result<void> {
        if (!rules || rules.length === 0) {
            return failure("Nenhuma regra de ciclo encontrada para o compromisso.");
        }
        return success(undefined);
    }

    /**
     * Validação dos limites do ciclo resolvido frente ao range solicitado e à vigência do acordo.
     */
    static validateResolvedWindow(params: {
        requestedRange: CycleRange;
        resolvedCurrent: CycleWindowBoundaries;
        agreement: { startsAt: Date; endsAt: Date | null };
    }): Result<void> {
        // 1. Verificar match exato do período solicitado
        if (
            params.resolvedCurrent.range.from !== params.requestedRange.from ||
            params.resolvedCurrent.range.to !== params.requestedRange.to
        ) {
            return failure(
                "Período de vigência informado não corresponde a um ciclo válido para as regras deste compromisso."
            );
        }

        // 2. Verificar limite inicial do acordo (agreement.startsAt)
        // Se a data final do ciclo for anterior ao início do contrato, o ciclo é inválido
        if (
            isBefore(
                startOfDay(parseCivilDate(params.resolvedCurrent.range.to)),
                startOfDay(params.agreement.startsAt)
            )
        ) {
            return failure(
                "Período de vigência informado é anterior ao início do compromisso."
            );
        }

        // 3. Verificar limite final do acordo (agreement.endsAt)
        // Se a data inicial do ciclo for posterior ao término do contrato, o ciclo é inválido
        if (
            params.agreement.endsAt &&
            isAfter(
                startOfDay(parseCivilDate(params.resolvedCurrent.range.from)),
                startOfDay(params.agreement.endsAt)
            )
        ) {
            return failure(
                "Período de vigência informado é posterior ao término do compromisso."
            );
        }

        return success(undefined);
    }
}

