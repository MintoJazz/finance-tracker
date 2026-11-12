import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { parseISO } from "date-fns"
import type { CycleView } from "@/modules/cycles/models/obligation-cycle.schema"
import {
  formatCycleRelativeDue,
  groupCycles,
  toCycleRowVM,
} from "./cycle-view-model"

describe("CycleViewModel - Quitar Obrigação", () => {
  const baseToday = parseISO("2025-11-10T12:00:00Z")

  it("formata data relativa corretamente para ciclos vencidos há meses", () => {
    const res = formatCycleRelativeDue("2025-02-10", baseToday)
    assert.equal(res.relative, "Venceu há 9 meses")
    assert.equal(res.formatted, "10/02/2025")
  })

  it("formata data relativa para ciclos a vencer em dias ou meses", () => {
    const resDias = formatCycleRelativeDue("2025-11-20", baseToday)
    assert.equal(resDias.relative, "Vence em 10 dias")

    const resMes = formatCycleRelativeDue("2025-12-15", baseToday)
    assert.equal(resMes.relative, "Vence em 1 mês")
  })

  it("formata ciclo parcial exibindo valor restante e original na dueLabel", () => {
    const partialCycle: CycleView = {
      agreementId: 1,
      referenceDate: "2025-02-01",
      dueDate: "2025-02-10",
      expected: 68000,
      accrued: 68000,
      settled: 34000,
      outstanding: 34000,
      status: "PARTIAL",
      isOverdue: true,
      label: "Fevereiro 2025",
    }

    const vm = toCycleRowVM(partialCycle, baseToday)
    assert.equal(vm.label, "Fevereiro 2025")
    assert.equal(vm.amount, 34000)
    assert.equal(vm.originalAmount, 68000)
    assert.equal(vm.isPartial, true)
    assert.equal(vm.tone, "overdue")
    assert.ok(vm.dueLabel.includes("Restam de"))
    assert.ok(vm.dueLabel.includes("680,00"))
  })

  it("agrupa ciclos em Vencidos, A vencer e Liquidados e detecta allUnrecorded", () => {
    const cycles: CycleView[] = [
      {
        agreementId: 1,
        referenceDate: "2025-01-01",
        dueDate: "2025-01-10",
        expected: 50000,
        accrued: 50000,
        settled: 50000,
        outstanding: 0,
        status: "SETTLED",
        isOverdue: false,
        label: "Janeiro 2025",
      },
      {
        agreementId: 1,
        referenceDate: "2025-02-01",
        dueDate: "2025-02-10",
        expected: 50000,
        accrued: 50000,
        settled: 0,
        outstanding: 50000,
        status: "UNRECORDED",
        isOverdue: true,
        label: "Fevereiro 2025",
      },
      {
        agreementId: 1,
        referenceDate: "2025-12-01",
        dueDate: "2025-12-10",
        expected: 50000,
        accrued: 50000,
        settled: 0,
        outstanding: 50000,
        status: "UNRECORDED",
        isOverdue: false,
        label: "Dezembro 2025",
      },
    ]

    const groups = groupCycles(cycles, baseToday)
    assert.equal(groups.settled.length, 1)
    assert.equal(groups.settled[0].label, "Janeiro 2025")
    assert.equal(groups.settled[0].disabled, true)

    assert.equal(groups.overdue.length, 1)
    assert.equal(groups.overdue[0].label, "Fevereiro 2025")
    assert.equal(groups.overdue[0].tone, "overdue")

    assert.equal(groups.upcoming.length, 1)
    assert.equal(groups.upcoming[0].label, "Dezembro 2025")
    assert.equal(groups.upcoming[0].tone, "upcoming")

    // Ambos os ciclos em aberto são UNRECORDED -> allUnrecorded = true
    assert.equal(groups.allUnrecorded, true)
  })
})

