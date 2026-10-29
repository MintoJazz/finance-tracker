import { MoneyInput } from "@/components/form"
import { Input } from "@/components/ui/input"
import type { FormField } from "@/types/form.types"
import type { CardFormValues } from "@/modules/cards/models/card.schema"

export const cardFormFields: FormField<CardFormValues>[] = [
  {
    name: "name",
    label: "Nome do cartão",
    description: "Ex: Nubank Ultravioleta, Inter Black, Itaú Azul...",
    children: (
      <Input
        placeholder="Digite o nome do cartão"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        data-1p-ignore="true"
        data-lpignore="true"
      />
    ),
  },
  {
    name: "limit",
    label: "Limite total",
    description: "Limite total de crédito concedido no cartão.",
    children: (
      <MoneyInput
        placeholder="R$ 0,00"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 font-mono text-base tabular-nums shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      />
    ),
  },
  {
    name: "closingDay",
    label: "Dia de fechamento",
    description: "Dia do mês em que a fatura fecha (1 a 31).",
    children: (_ctx, field) => (
      <Input
        type="number"
        min={1}
        max={31}
        step={1}
        placeholder="Ex: 1"
        value={
          typeof field.value === "number" && field.value > 0 ? field.value : ""
        }
        onChange={(e) => {
          const val = e.target.value
          field.onChange(val === "" ? "" : Number(val))
        }}
        className="font-mono tabular-nums"
      />
    ),
  },
  {
    name: "dueDay",
    label: "Dia de vencimento",
    description: "Dia do mês em que a fatura vence (1 a 31).",
    children: (_ctx, field) => (
      <Input
        type="number"
        min={1}
        max={31}
        step={1}
        placeholder="Ex: 10"
        value={
          typeof field.value === "number" && field.value > 0 ? field.value : ""
        }
        onChange={(e) => {
          const val = e.target.value
          field.onChange(val === "" ? "" : Number(val))
        }}
        className="font-mono tabular-nums"
      />
    ),
  },
]
