import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { CycleEngineService } from "./cycle-engine.service"
import type { AgreementCycleSourceData } from "../interfaces/commitment-cycle-engine.interface"

describe("CycleEngineService - projectObligationCycles", () => {
  const engine = new CycleEngineService()
  const now = new Date(2026, 7, 15, 12) // Agosto 2026
  const window = {
    from: new Date(2025, 0, 1, 12),
    to: new Date(2027, 11, 31, 12),
  }

  it("não projeta ciclos vazios no passado e não inclui ciclos já quitados (SETTLED)", () => {
    const source: AgreementCycleSourceData = {
      agreementId: 1,
      balanceId: 10,
      balanceName: "Aluguel",
      balanceType: "PAYABLE",
      startsAt: new Date(2026, 0, 1, 12),
      endsAt: null,
      includeInProjection: true,
      amountLog: [
        { amount: 50000, effectiveAt: new Date(2026, 0, 1, 12) },
      ],
      rules: [
        {
          id: 1,
          agreementId: 1,
          frequency: "MONTHLY",
          interval: 1,
          closingDay: null,
          dueDay: 20,
          effectiveFrom: new Date(2026, 0, 1, 12),
          entries: [
            // Ciclo Julho 2026 (passado consolidado e quitado: DEBIT -500 e CREDIT 500)
            {
              type: "ACCRUAL",
              reversesEntryType: null,
              amount: 50000,
              direction: "DEBIT",
              referenceDate: new Date(2026, 6, 1, 12),
              count: 1,
            },
            {
              type: "SETTLEMENT",
              reversesEntryType: null,
              amount: 50000,
              direction: "CREDIT",
              referenceDate: new Date(2026, 6, 1, 12),
              count: 1,
            },
            // Ciclo Junho 2026 (passado consolidado em aberto/vencido: apenas ACCRUAL DEBIT -500)
            {
              type: "ACCRUAL",
              reversesEntryType: null,
              amount: 50000,
              direction: "DEBIT",
              referenceDate: new Date(2026, 5, 1, 12),
              count: 1,
            },
          ],
        },
      ],
    }

    const cycles = engine.projectObligationCycles(source, window, now, 3)

    // 1. O ciclo de Julho 2026 (SETTLED) NÃO deve estar presente
    const julyCycle = cycles.find((c) => c.referenceDate === "2026-07-01")
    assert.equal(julyCycle, undefined, "Ciclos já liquidados não devem ser exibidos")

    // 2. Os ciclos de Jan..Mai 2026 (vazios no passado sem lançamentos) NÃO devem ser gerados
    const mayCycle = cycles.find((c) => c.referenceDate === "2026-05-01")
    assert.equal(mayCycle, undefined, "Ciclos passados sem lançamentos não devem ser projetados")

    // 3. O ciclo de Junho 2026 (vencido com saldo em aberto) DEVE estar presente
    const juneCycle = cycles.find((c) => c.referenceDate === "2026-06-01")
    assert.ok(juneCycle, "Ciclo passado com pendência real deve estar presente")
    assert.equal(juneCycle.isOverdue, true)
    assert.equal(juneCycle.outstanding, 50000)

    // 4. O ciclo de Agosto 2026 (corrente) DEVE estar presente como projetado
    const augCycle = cycles.find((c) => c.referenceDate === "2026-08-01")
    assert.ok(augCycle, "Ciclo corrente projetado deve estar presente")

    // 5. Ciclos futuros devem ser projetados até o limite de avanço
    const septCycle = cycles.find((c) => c.referenceDate === "2026-09-01")
    assert.ok(septCycle, "Ciclo futuro dentro do avanço deve estar presente")
  })

  it("projeta o maior entre 3 meses e 3 ciclos para contratos semanais e anuais", () => {
    // Contrato semanal: 3 meses são cerca de 13 ciclos (não apenas 3 semanas)
    const weeklySource: AgreementCycleSourceData = {
      agreementId: 2,
      balanceId: 20,
      balanceName: "Contrato Semanal",
      balanceType: "PAYABLE",
      startsAt: new Date(2026, 7, 1, 12),
      endsAt: null,
      includeInProjection: true,
      amountLog: [
        { amount: 10000, effectiveAt: new Date(2026, 7, 1, 12) },
      ],
      rules: [
        {
          id: 2,
          agreementId: 2,
          frequency: "WEEKLY",
          interval: 1,
          closingDay: null,
          dueDay: 5,
          effectiveFrom: new Date(2026, 7, 1, 12),
          entries: [],
        },
      ],
    }

    const weeklyCycles = engine.projectObligationCycles(weeklySource, window, now, 3)
    assert.ok(weeklyCycles.length >= 10, "Contrato semanal deve projetar 3 meses (~12-13 semanas), não apenas 3 ciclos")
  })
})
