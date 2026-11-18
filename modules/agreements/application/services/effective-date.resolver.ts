import type { CycleFrequency } from "@/prisma/generated/prisma/client";
import {
    CycleEngineRegistry,
    type CycleRuleRecord,
} from "@/modules/cycles/application/services/cycle-engine.registry";
import type { EffectiveMode } from "@/modules/agreements/models/effective-from.schema";
import { AgreementAdjustmentDomainError } from "../policies/agreement-adjustment.policy";
import { resolveEffectiveRule } from "./agreement-ledger";
import {
    addCivilDays,
    civilToLocalMidnight,
    toCivilString,
    utcDateToCivil,
} from "./civil-date";

export interface EffectiveDateAgreement {
    frequency: CycleFrequency;
    interval: number;
    startsAt: Date;
    endsAt: Date | null;
}

export interface ResolveEffectiveDateParams {
    mode: EffectiveMode;
    /** YYYY-MM-DD; obrigatório quando `mode` é DATE. */
    effectiveFrom?: string | null;
    today: Date;
    agreement: EffectiveDateAgreement;
    rules: CycleRuleRecord[];
}

/** Converte coluna `@db.Date` (UTC) em meia-noite local, que é o que o motor de ciclos espera. */
const dbDateToLocal = (date: Date) => civilToLocalMidnight(utcDateToCivil(date));

/**
 * Resolve "quando começa a valer" em um dia civil concreto (YYYY-MM-DD):
 * - NOW: hoje
 * - DATE: a data informada (nunca no passado)
 * - NEXT_CYCLE: o dia seguinte ao fim do ciclo vigente (pelo motor de ciclos)
 */
export function resolveEffectiveDate(params: ResolveEffectiveDateParams): string {
    const todayCivil = toCivilString(params.today);

    switch (params.mode) {
        case "NOW":
            return todayCivil;

        case "DATE": {
            if (!params.effectiveFrom) {
                throw new AgreementAdjustmentDomainError(
                    "Informe a data em que o ajuste começa a valer.",
                    "DATE_REQUIRED"
                );
            }
            if (params.effectiveFrom < todayCivil) {
                throw new AgreementAdjustmentDomainError(
                    "A data de vigência não pode estar no passado.",
                    "DATE_IN_PAST"
                );
            }
            return params.effectiveFrom;
        }

        case "NEXT_CYCLE": {
            const activeRule = resolveEffectiveRule(params.rules, params.today);
            if (!activeRule) {
                throw new AgreementAdjustmentDomainError(
                    "Não há regra de ciclo para calcular o próximo ciclo.",
                    "NO_CYCLE_RULE"
                );
            }

            const geometry = CycleEngineRegistry.getStrategy(
                params.agreement.frequency
            ).resolveGeometryForDate(
                civilToLocalMidnight(todayCivil),
                {
                    ...params.agreement,
                    startsAt: dbDateToLocal(params.agreement.startsAt),
                    endsAt: params.agreement.endsAt
                        ? dbDateToLocal(params.agreement.endsAt)
                        : null,
                },
                { ...activeRule, effectiveFrom: dbDateToLocal(activeRule.effectiveFrom) }
            );

            return addCivilDays(toCivilString(geometry.endsAt), 1);
        }
    }
}
