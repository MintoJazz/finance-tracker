import {
    addDays,
    format,
    isAfter,
    isBefore,
    max,
    startOfDay,
    subDays,
} from "date-fns";
import {
    civilToLocalMidnight,
    utcDateToCivil,
} from "@/modules/agreements/application/services/civil-date";
import { CycleRange } from "@/modules/cycles/models/cycle-primitives.schema";
import {
    AgreementScheduleContext,
    CycleEngineRegistry,
    CycleRuleRecord,
} from "./cycle-engine.registry";

/**
 * Normaliza colunas `@db.Date` (meia-noite UTC) para meia-noite civil local sem deslocar -1 dia
 * em fusos negativos, preservando datas já construídas em horário local.
 */
function normalizeCivilDate(date: Date): Date {
    if (
        date.getUTCHours() === 0 &&
        date.getUTCMinutes() === 0 &&
        date.getUTCSeconds() === 0 &&
        date.getUTCMilliseconds() === 0
    ) {
        return civilToLocalMidnight(utcDateToCivil(date));
    }
    return startOfDay(date);
}

export interface CycleWindowBoundaries {
    range: CycleRange; // { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
    beginsAt: Date;
    endsAt: Date;
    closingDate: Date | null;
    dueDate: Date;
    label: string;
    rule: CycleRuleRecord;
    isBridgeCycle: boolean;
}

export interface GenerateWindowsParams {
    agreement: AgreementScheduleContext;
    /** Regras do horizonte (incluindo a regra âncora anterior e a posterior, se houver) */
    rules: CycleRuleRecord[];
    /** Janela temporal de busca */
    window: {
        from: Date;
        to: Date;
    };
    /**
     * Critério de pertencimento da vigência ao horizonte:
     * - "DUE_DATE": inclui o ciclo inteiro se `dueDate` cair dentro de [window.from, window.to] (ideal para Listagens)
     * - "OVERLAP": inclui o ciclo inteiro se [beginsAt, endsAt] tiver interseção com [window.from, window.to] (ideal para Vizinhança/Detalhe)
     */
    anchorMode?: "DUE_DATE" | "OVERLAP";
}

export class CycleWindowEngine {
    /**
     * Gera a sequência contígua e ordenada de vigências canônicas dentro da janela informada.
     * Usado tanto pela Listagem (macro-horizonte) quanto pelo Perfil (vizinhança [prev, current, next]).
     */
    static generateWindows(params: GenerateWindowsParams): CycleWindowBoundaries[] {
        const { agreement, rules, window, anchorMode = "DUE_DATE" } = params;

        if (rules.length === 0) {
            return [];
        }

        const sortedRules = [...rules]
            .map((r) => ({ ...r, effectiveFrom: normalizeCivilDate(r.effectiveFrom) }))
            .sort((a, b) => a.effectiveFrom.getTime() - b.effectiveFrom.getTime());

        const winFrom = normalizeCivilDate(window.from);
        const winTo = normalizeCivilDate(window.to);
        const agreementStart = normalizeCivilDate(agreement.startsAt);
        const agreementEnd = agreement.endsAt ? normalizeCivilDate(agreement.endsAt) : null;
        const normalizedAgreement: AgreementScheduleContext = {
            ...agreement,
            startsAt: agreementStart,
            endsAt: agreementEnd,
        };

        // Caso especial ONCE: possui apenas 1 ciclo na vida toda do acordo
        if (normalizedAgreement.frequency === "ONCE") {
            const single = this.resolveWindowForDate(
                agreementStart,
                normalizedAgreement,
                sortedRules
            );
            if (!single) return [];
            return this.matchesHorizonAndAgreement(
                single,
                winFrom,
                winTo,
                agreementStart,
                agreementEnd,
                anchorMode
            )
                ? [single]
                : [];
        }

        // Recua 1 ciclo antes de winFrom para garantir que um ciclo que começou no fim do ano anterior
        // mas vence/fecha dentro de [winFrom, winTo] seja capturado inteiro!
        const strategy = CycleEngineRegistry.getStrategy(normalizedAgreement.frequency);
        const initialSweepDate = max([
            agreementStart,
            strategy.stepDate(winFrom, -1, normalizedAgreement.interval),
        ]);

        const results: CycleWindowBoundaries[] = [];
        const seenKeys = new Set<string>();

        let cursor = startOfDay(initialSweepDate);
        const maxSweepLimit = strategy.stepDate(winTo, 1, normalizedAgreement.interval);
        const MAX_ITERATIONS = 500; // Guardrail contra loops infinitos
        let iterations = 0;

        while (!isAfter(cursor, maxSweepLimit) && iterations < MAX_ITERATIONS) {
            iterations++;

            // Se já passamos do fim do contrato, encerramos a geração imediatamente
            if (agreementEnd && isAfter(cursor, agreementEnd)) {
                break;
            }

            const resolved = this.resolveWindowForDate(cursor, normalizedAgreement, sortedRules);
            if (!resolved) {
                break;
            }

            const key = `${resolved.range.from}_${resolved.range.to}`;
            if (!seenKeys.has(key)) {
                seenKeys.add(key);

                if (
                    this.matchesHorizonAndAgreement(
                        resolved,
                        winFrom,
                        winTo,
                        agreementStart,
                        agreementEnd,
                        anchorMode
                    )
                ) {
                    results.push(resolved);
                }
            }

            // Avança o cursor para o primeiro dia após o término da vigência atual (contíguo, sem buracos)
            const nextCursor = addDays(resolved.endsAt, 1);
            if (!isAfter(nextCursor, cursor)) {
                break;
            }
            cursor = nextCursor;
        }

        return results;
    }

    /**
     * Resolve uma única vigência canônica para uma data `cursor`, tratando automaticamente
     * transições entre regras (Ciclos Ponte).
     */
    static resolveWindowForDate(
        cursor: Date,
        agreement: AgreementScheduleContext,
        sortedRules: CycleRuleRecord[]
    ): CycleWindowBoundaries | null {
        if (sortedRules.length === 0) return null;

        const targetDate = normalizeCivilDate(cursor);
        const normalizedAgreement: AgreementScheduleContext = {
            ...agreement,
            startsAt: normalizeCivilDate(agreement.startsAt),
            endsAt: agreement.endsAt ? normalizeCivilDate(agreement.endsAt) : null,
        };
        const normalizedRules = sortedRules.map((r) => ({
            ...r,
            effectiveFrom: normalizeCivilDate(r.effectiveFrom),
        }));
        const strategy = CycleEngineRegistry.getStrategy(normalizedAgreement.frequency);

        // 1. Localiza a regra vigente em targetDate (última com effectiveFrom <= targetDate, ou a primeira disponível)
        let activeRuleIndex = 0;
        for (let i = 0; i < normalizedRules.length; i++) {
            if (!isAfter(normalizedRules[i].effectiveFrom, targetDate)) {
                activeRuleIndex = i;
            } else {
                break;
            }
        }

        const activeRule = normalizedRules[activeRuleIndex];
        const prevRule = activeRuleIndex > 0 ? normalizedRules[activeRuleIndex - 1] : null;
        const nextRule =
            activeRuleIndex < normalizedRules.length - 1
                ? normalizedRules[activeRuleIndex + 1]
                : null;

        const raw = strategy.resolveGeometryForDate(targetDate, normalizedAgreement, activeRule);

        let beginsAt = raw.beginsAt;
        let endsAt = raw.endsAt;
        let closingDate = raw.closingDate;
        let dueDate = raw.dueDate;
        let label = raw.label;
        let effectiveRule = activeRule;
        let isBridgeCycle = false;

        // 2. Transição com Regra Anterior (Ciclo Ponte na entrada da nova regra):
        // Se havia uma regra anterior e este ciclo contém `ruleStart`, o início nunca pode sobrepor
        // a regra anterior: começa no dia seguinte ao fechamento anterior ou no `beginsAt` do ciclo
        // da regra anterior que cruzou `ruleStart`.
        if (prevRule) {
            const ruleStart = activeRule.effectiveFrom;
            if (!isAfter(beginsAt, ruleStart) && !isAfter(ruleStart, endsAt)) {
                const lastDayOfPrevRule = subDays(ruleStart, 1);
                const prevGeo = strategy.resolveGeometryForDate(
                    lastDayOfPrevRule,
                    normalizedAgreement,
                    prevRule
                );

                const expectedBridgeStart = isBefore(prevGeo.endsAt, ruleStart)
                    ? addDays(prevGeo.endsAt, 1)
                    : prevGeo.beginsAt;

                if (beginsAt.getTime() !== expectedBridgeStart.getTime()) {
                    beginsAt = expectedBridgeStart;
                    isBridgeCycle = true;
                }
            }
        }

        // 3. Transição com Próxima Regra (Ciclo Ponte na saída da regra atual):
        // Se uma nova regra entra em vigor (`nextRule.effectiveFrom`) no meio desta vigência (antes de endsAt),
        // a nova regra assume o fechamento e o vencimento deste ciclo de transição!
        if (nextRule) {
            const nextRuleStart = nextRule.effectiveFrom;
            if (!isAfter(nextRuleStart, endsAt) && !isBefore(nextRuleStart, beginsAt)) {
                const nextGeo = strategy.resolveGeometryForDate(
                    nextRuleStart,
                    normalizedAgreement,
                    nextRule
                );
                endsAt = nextGeo.endsAt;
                closingDate = nextGeo.closingDate;
                dueDate = nextGeo.dueDate;
                label = nextGeo.label;
                effectiveRule = nextRule;
                isBridgeCycle = true;
            }
        }

        return {
            range: {
                from: format(beginsAt, "yyyy-MM-dd"),
                to: format(endsAt, "yyyy-MM-dd"),
            },
            beginsAt,
            endsAt,
            closingDate,
            dueDate,
            label,
            rule: effectiveRule,
            isBridgeCycle,
        };
    }

    /**
     * Verifica se a vigência inteira respeita a vida útil do Agreement e pertence ao horizonte solicitado.
     */
    private static matchesHorizonAndAgreement(
        cycle: CycleWindowBoundaries,
        winFrom: Date,
        winTo: Date,
        agreementStart: Date,
        agreementEnd: Date | null,
        anchorMode: "DUE_DATE" | "OVERLAP"
    ): boolean {
        // 1. Respeita a vigência do Agreement (por overlap, sem cortar a vigência ao meio)
        if (isBefore(cycle.endsAt, agreementStart)) {
            return false;
        }
        if (agreementEnd && isAfter(cycle.beginsAt, agreementEnd)) {
            return false;
        }

        // 2. Respeita a janela do horizonte solicitado
        if (anchorMode === "DUE_DATE") {
            return !isBefore(cycle.dueDate, winFrom) && !isAfter(cycle.dueDate, winTo);
        }

        // Modo OVERLAP (usado para buscar a vizinhança [prev, current, next] no Detalhe)
        return !isBefore(cycle.endsAt, winFrom) && !isAfter(cycle.beginsAt, winTo);
    }
}