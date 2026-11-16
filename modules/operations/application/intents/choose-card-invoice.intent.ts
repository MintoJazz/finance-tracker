import {
  buildInitialCardInvoiceIntentSlice,
  ChooseCardInvoiceIntentSliceSchema,
} from "../../models/intents/choose-card-invoice.schema"
import type { OperationIntentKey } from "../../models/operation-input.schema"
import { chooseCardInvoiceStep } from "../steps/intents/choose-card-invoice.step"
import { STEP_ORDER } from "../steps/order"
import type { SummaryRow } from "../summary/types"
import type { IntentDefinition } from "./types"

export const chooseCardInvoiceIntent = {
  key: "CHOOSE_CARD_INVOICE",
  schema: ChooseCardInvoiceIntentSliceSchema,
  initialSlice: (ctx) => buildInitialCardInvoiceIntentSlice(ctx),
  addSteps: [chooseCardInvoiceStep],
  removeSteps: [],
  excludes: [],
  requires: [],
  offer: {
    at: ["base.custody", "intent.choose_card_invoice", "base.amount"],
    label: "Escolher fatura",
    description:
      "Permite escolher manualmente a fatura do cartão para este lançamento.",
    icon: "Calendar",
    when: (data, ctx) => {
      if (data.base?.custodyType === "CREDIT") return true
      if (ctx?.lookups && data.base?.custodyBalanceId) {
        const found = ctx.lookups.custodies.find(
          (c) => c.id === data.base?.custodyBalanceId
        )
        return found?.type === "CREDIT"
      }
      return false
    },
  },
  plan(_ctx) {
    // A intenção é declarativa e alimenta a atribuição da fatura alvo
    // no nó de lançamento direto (CREATE_DIRECT_ENTRY) durante a compilação.
  },
  summaryCard(ctx) {
    const slice = ctx.payload.CHOOSE_CARD_INVOICE
    const custodyId = ctx.payload.base?.custodyBalanceId
    const custody = ctx.lookups.custodies.find((c) => c.id === custodyId)

    const rows: SummaryRow[] = [
      {
        id: "invoice_period",
        label: "Fatura Selecionada",
        value: {
          kind: "text",
          text: slice?.label?.trim() || "Não selecionada",
        },
        stepId: "intent.choose_card_invoice",
      },
      ...(slice?.dueDate
        ? [
            {
              id: "invoice_due_date",
              label: "Vencimento da Fatura",
              value: {
                kind: "date" as const,
                iso: slice.dueDate,
              },
              stepId: "intent.choose_card_invoice",
            },
          ]
        : []),
      {
        id: "invoice_card",
        label: "Cartão",
        value: {
          kind: "text",
          text: custody?.name ?? "Não selecionado",
        },
        stepId: "base.custody",
      },
    ]

    return {
      id: "summary.intent.choose_card_invoice",
      source: "CHOOSE_CARD_INVOICE",
      order: STEP_ORDER.CHOOSE_CARD_INVOICE,
      title: "Fatura do Cartão",
      icon: "Calendar",
      badge: {
        label: "Manual",
        tone: "neutral",
      },
      rows,
    }
  },
} as const satisfies IntentDefinition<OperationIntentKey>
