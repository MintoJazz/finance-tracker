import {
    addDays,
    format,
    isAfter,
    isBefore,
    max,
    min,
    startOfDay,
    subDays,
} from "date-fns";
import { CycleRange } from "@/modules/cycles/models/cycle-primitives.schema";
import {
    AgreementScheduleContext,
    CycleEngineRegistry,
    CycleRuleRecord,
} from "./cycle-engine.registry";

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

        const sortedRules = [...rules].sort(
            (a, b) => a.effectiveFrom.getTime() - b.effectiveFrom.getTime()
        );

        const winFrom = startOfDay(window.from);
        const winTo = startOfDay(window.to);
        const agreementStart = startOfDay(agreement.startsAt);
        const agreementEnd = agreement.endsAt ? startOfDay(agreement.endsAt) : null;

        // Caso especial ONCE: possui apenas 1 ciclo na vida toda do acordo
        if (agreement.frequency === "ONCE") {
            const single = this.resolveWindowForDate(
                agreementStart,
                agreement,
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
        const strategy = CycleEngineRegistry.getStrategy(agreement.frequency);
        const initialSweepDate = max([
            agreementStart,
            strategy.stepDate(winFrom, -1, agreement.interval),
        ]);

        const results: CycleWindowBoundaries[] = [];
        const seenKeys = new Set<string>();

        let cursor = startOfDay(initialSweepDate);
        const maxSweepLimit = strategy.stepDate(winTo, 1, agreement.interval);
        const MAX_ITERATIONS = 500; // Guardrail contra loops infinitos
        let iterations = 0;

        while (!isAfter(cursor, maxSweepLimit) && iterations < MAX_ITERATIONS) {
            iterations++;

            // Se já passamos do fim do contrato, encerramos a geração imediatamente
            if (agreementEnd && isAfter(cursor, agreementEnd)) {
                break;
            }

            const resolved = this.resolveWindowForDate(cursor, agreement, sortedRules);
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

        const targetDate = startOfDay(cursor);
        const strategy = CycleEngineRegistry.getStrategy(agreement.frequency);

        // 1. Localiza a regra vigente em targetDate (última com effectiveFrom <= targetDate, ou a primeira disponível)
        let activeRuleIndex = 0;
        for (let i = 0; i < sortedRules.length; i++) {
            if (!isAfter(startOfDay(sortedRules[i].effectiveFrom), targetDate)) {
                activeRuleIndex = i;
            } else {
                break;
            }
        }

        const activeRule = sortedRules[activeRuleIndex];
        const prevRule = activeRuleIndex > 0 ? sortedRules[activeRuleIndex - 1] : null;
        const nextRule =
            activeRuleIndex < sortedRules.length - 1
                ? sortedRules[activeRuleIndex + 1]
                : null;

        const raw = strategy.resolveGeometryForDate(targetDate, agreement, activeRule);

        let beginsAt = raw.beginsAt;
        let endsAt = raw.endsAt;
        let closingDate = raw.closingDate;
        let dueDate = raw.dueDate;
        let label = raw.label;
        let effectiveRule = activeRule;
        let isBridgeCycle = false;

        // 2. Transição com Regra Anterior (Ciclo Ponte na entrada da nova regra):
        // Se havia uma regra anterior, o ciclo atual jamais pode começar antes ou sobrepor o último fechamento da regra anterior.
        if (prevRule) {
            const ruleStart = startOfDay(activeRule.effectiveFrom);
            const lastDayOfPrevRule = subDays(ruleStart, 1);
            const prevGeo = strategy.resolveGeometryForDate(
                lastDayOfPrevRule,
                agreement,
                prevRule
            );

            // Se a regra anterior fechou antes de ruleStart, a ponte começa no dia seguinte ao fechamento anterior
            if (isBefore(prevGeo.endsAt, ruleStart)) {
                const expectedBridgeStart = addDays(prevGeo.endsAt, 1);
                if (beginsAt.getTime() !== expectedBridgeStart.getTime() && isBefore(targetDate, endsAt)) {
                    beginsAt = expectedBridgeStart;
                    isBridgeCycle = true;
                }
            }
        }

        // 3. Transição com Próxima Regra (Ciclo Ponte na saída da regra atual):
        // Se uma nova regra entra em vigor (`nextRule.effectiveFrom`) no meio desta vigência (antes de endsAt),
        // a nova regra assume o fechamento e o vencimento deste ciclo de transição!
        if (nextRule) {
            const nextRuleStart = startOfDay(nextRule.effectiveFrom);
            if (!isAfter(nextRuleStart, endsAt) && !isBefore(nextRuleStart, beginsAt)) {
                const nextGeo = strategy.resolveGeometryForDate(
                    nextRuleStart,
                    agreement,
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