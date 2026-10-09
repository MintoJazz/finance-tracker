import {
    AgreementCycleSourceData,
    CycleWindow,
} from "./commitment-cycle-engine.interface";

/**
 * Port de consulta para alimentação do motor de ciclos de compromissos.
 *
 * Contrato:
 * - A infraestrutura busca dados com folga temporal ao redor de `window` (ao menos 1 ciclo antes e 1 depois),
 *   pois uma transação pode pertencer ao ciclo da janela devido ao fechamento (`closingDay`).
 *   O motor refiltra e projeta a janela exata.
 * - A infraestrutura devolve o LOG COMPLETO (`amountLog`) de cada agreement ordenado por `effectiveAt ASC`.
 *   NUNCA filtre o log de valores por janela, pois isso descartaria deltas anteriores e corromperia a soma.
 * - Os dados de movimentações são pré-agregados por regra, data de referência, tipo e direção.
 */
export interface ICommitmentCyclesQueries {
    findCycleSources(
        contextId: number,
        window: CycleWindow
    ): Promise<AgreementCycleSourceData[]>;
}
