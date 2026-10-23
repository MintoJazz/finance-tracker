import * as React from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { MoneyInput, ControlFirstLayout } from "@/components/form";
import { DateRangePicker } from "@/components/form/date-picker/date-range";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ContractCycleField } from "./cycle-fields";
import type { DateRange } from "react-day-picker";
import type { FormField } from "@/types/form.types";
import type {
  ContractFormValues,
  ContractScheduleValues,
} from "../../../core/schemas/contract-form.schema";

const FREQUENCY_ITEMS: Record<string, string> = {
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  YEARLY: "Anual",
};

export const contractFormFields: FormField<ContractFormValues>[] = [
  {
    name: "type",
    label: "Natureza do contrato",
    children: (_ctx, field) => (
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <button
          type="button"
          onClick={() => field.onChange("PAYABLE")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg border py-2 px-3 text-xs font-medium transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
            field.value === "PAYABLE"
              ? "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold ring-1 ring-red-500/30"
              : "border-border hover:bg-muted text-muted-foreground"
          )}
        >
          <ArrowUpRight className="size-4 text-red-500 shrink-0" />
          A Pagar (Despesa)
        </button>
        <button
          type="button"
          onClick={() => field.onChange("RECEIVABLE")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg border py-2 px-3 text-xs font-medium transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
            field.value === "RECEIVABLE"
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold ring-1 ring-emerald-500/30"
              : "border-border hover:bg-muted text-muted-foreground"
          )}
        >
          <ArrowDownLeft className="size-4 text-emerald-500 shrink-0" />
          A Receber (Receita)
        </button>
      </div>
    ),
  },
  {
    name: "name",
    label: "Nome do contrato",
    children: (
      <Input
        placeholder="Digite o nome do contrato"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
    ),
  },
  {
    name: "value",
    label: "Valor recorrente",
    children: (
      <MoneyInput
        placeholder="R$ 0,00"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono tabular-nums"
      />
    ),
  },
  {
    row: [
      {
        name: "frequency",
        label: "Frequência",
        children: (_ctx, field) => (
          <Select
            value={field.value}
            items={FREQUENCY_ITEMS}
            onValueChange={(val) => {
              if (val) field.onChange(val);
            }}
          >
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Selecione a frequência">
                {field.value && typeof field.value === "string" && FREQUENCY_ITEMS[field.value]
                  ? FREQUENCY_ITEMS[field.value]
                  : "Selecione a frequência"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WEEKLY">Semanal</SelectItem>
              <SelectItem value="MONTHLY">Mensal</SelectItem>
              <SelectItem value="YEARLY">Anual</SelectItem>
            </SelectContent>
          </Select>
        ),
      },
      {
        name: "validity",
        label: "Período de vigência",
        children: (_ctx, field) => (
          <DateRangePicker
            value={field.value as DateRange | undefined}
            onChange={(range) => field.onChange(range)}
            placeholder="Selecione o período de vigência..."
            className="h-9 text-sm"
          />
        ),
      },
    ],
  },
  {
    name: "hasCustomClosingDay",
    label: "Data de fechamento diferente da data de vencimento",
    layout: ControlFirstLayout,
    children: (_ctx, field) => (
      <Checkbox
        checked={Boolean(field.value)}
        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
      />
    ),
  },
  {
    name: "schedule",
    children: (_ctx, field) => (
      <ContractCycleField
        value={field.value as ContractScheduleValues | undefined}
        onChange={(val) => field.onChange(val)}
      />
    ),
  },
];
