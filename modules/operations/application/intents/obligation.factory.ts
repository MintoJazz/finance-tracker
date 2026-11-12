import {
  buildInitialObligationIntentSlice,
  ObligationSliceSchema,
} from "../../models/intents/obligation.schema"
import type { OperationIntentKey } from "../../models/operation-input.schema"
import { STEP_ORDER } from "../steps/order"
import { createObligationContractStep } from "../steps/intents/obligation-contract.step"
import { createObligationCyclesStep } from "../steps/intents/obligation-cycles.step"
import type { IntentDefinition } from "./types"

export function createObligationIntent(nature: "PAY" | "RECEIVE") {
  const isPay = nature === "PAY"
  const key: OperationIntentKey = isPay ? "PAY_OBLIGATION" : "RECEIVE_OBLIGATION"
  const oppositeKey: OperationIntentKey = isPay ? "RECEIVE_OBLIGATION" : "PAY_OBLIGATION"

  const contractStep = createObligationContractStep(nature)
  const cyclesStep = createObligationCyclesStep(nature)

  return {
    key,
    schema: ObligationSliceSchema,
    initialSlice: (ctx) => buildInitialObligationIntentSlice(ctx),
    addSteps: [contractStep, cyclesStep],
    removeSteps: [
      "base.amount",
      "base.category",
      "base.subcategory",
    ],
    excludes: [oppositeKey],
    requires: [],
    offer: {
      at: ["base.details"],
      label: isPay ? "Quitar obrigação" : "Receber obrigação",
      description: isPay
        ? "Quita ciclos em aberto de contratos a pagar ou fatura de cartão."
        : "Recebe ciclos em aberto de contratos a receber.",
      icon: isPay ? "Receipt" : "HandCoins",
      when: (data) => data.nature === nature,
    },
    plan({ payload, pointers, addNode }) {
      const slice = payload[key] as
        | {
            agreementId?: number
            allocations?: readonly {
              referenceDate: string
              amount: number
              status?: import("@/modules/cycles/models/obligation-cycle.schema").CycleStatus
            }[]
          }
        | undefined

      if (
        !slice?.agreementId ||
        !slice.allocations ||
        slice.allocations.length === 0
      ) {
        return
      }

      pointers.mainEntry = addNode({
        id: `intent.${key.toLowerCase()}`,
        source: key,
        order: STEP_ORDER.AMOUNT,
        stepId: `intent.${key.toLowerCase()}.cycles`,
        action: {
          type: "SETTLE_OBLIGATION",
          nature,
          agreementId: slice.agreementId,
          custody: pointers.custody,
          custodyType: payload.base?.custodyType ?? "WALLET",
          dueDate:
            payload.base?.dueDate ?? new Date().toISOString().slice(0, 10),
          description:
            payload.base?.description?.trim() ||
            (isPay ? "Quitação de Obrigação" : "Recebimento de Obrigação"),
          allocations: slice.allocations,
        },
      })
    },
    summaryCard(ctx) {
      const slice = ctx.payload[key] as
        | {
            agreementId?: number
            allocations?: readonly {
              referenceDate: string
              amount: number
              status?: import("@/modules/cycles/models/obligation-cycle.schema").CycleStatus
            }[]
          }
        | undefined

      const allocations = slice?.allocations ?? []
      const totalAmount = allocations.reduce(
        (sum, a) => sum + Math.abs(a.amount),
        0
      )
      const cyclesCount = allocations.length

      const agreementId = slice?.agreementId
      const custodyAgreement = agreementId
        ? ctx.lookups.custodies.find((c) => c.id === agreementId)
        : undefined
      const descriptionMatch = ctx.payload.base?.description
        ?.match(/^(?:Quitação|Recebimento)\s*-\s*(.+)$/i)?.[1]
        ?.trim()
      const contractName =
        (slice as any)?.contractName ||
        custodyAgreement?.name ||
        (descriptionMatch && descriptionMatch.length > 0 ? descriptionMatch : undefined) ||
        (agreementId ? `Contrato #${agreementId}` : "Não selecionado")

      return {
        id: `summary.intent.${key.toLowerCase()}`,
        source: key,
        order: STEP_ORDER.AMOUNT + 10,
        title: isPay ? "Quitação de Obrigação" : "Recebimento de Obrigação",
        icon: isPay ? "Receipt" : "HandCoins",
        badge: {
          label: isPay ? "Saída" : "Entrada",
          tone: isPay ? "danger" : "success",
        },
        rows: [
          {
            id: "obligation_contract",
            label: isPay ? "Contrato / Cartão" : "Contrato",
            value: {
              kind: "text",
              text: contractName,
            },
            stepId: `intent.${key.toLowerCase()}.contract`,
          },
          {
            id: "obligation_cycles",
            label: "Ciclos Quitados",
            value: {
              kind: "text",
              text: `${cyclesCount} ciclo${cyclesCount > 1 ? "s" : ""} a liquidar`,
            },
            stepId: `intent.${key.toLowerCase()}.cycles`,
          },
          {
            id: "obligation_cycles_total",
            label: "Total dos Ciclos",
            value:
              totalAmount > 0 ? { kind: "money", cents: totalAmount } : null,
            stepId: `intent.${key.toLowerCase()}.cycles`,
          },
        ],
        footer: [
          {
            id: "obligation_total",
            label: "Total a liquidar",
            value:
              totalAmount > 0 ? { kind: "money", cents: totalAmount } : null,
            stepId: `intent.${key.toLowerCase()}.cycles`,
          },
        ],
      }
    },
  } as const satisfies IntentDefinition<OperationIntentKey>
}
