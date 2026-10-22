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
import type { DateRange } from "react-day-picker";
import type { FormField } from "@/types/form.types";
import type { ContractFormValues } from "../../../core/schemas/contract-form.schema";

export const contractFormFields: FormField<ContractFormValues>[] = [
  {
    name: "type",
    label: "Natureza do contrato",
    description: "Indica se o contrato é uma despesa a pagar ou uma receita recorrente.",
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
    description: "Ex: Aluguel Residencial, Internet Fibra, Salário Mensal...",
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
    description: "Valor previsto para cada cobrança ou recebimento.",
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
        description: "Periodicidade das cobranças.",
        children: (_ctx, field) => (
          <Select
            value={field.value}
            onValueChange={(val) => {
              if (val) field.onChange(val);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a frequência" />
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
        description: "Data de início e término.",
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
    row: [
      {
        name: "dueDay",
        label: "Dia de vencimento",
        description: "Dia do mês em que vence a parcela (1 a 31).",
        children: (_ctx, field) => (
          <Input
            type="number"
            min={1}
            max={31}
            placeholder="Ex: 10"
            value={typeof field.value === "number" ? field.value : ""}
            onChange={(e) => {
              const val = e.target.value;
              field.onChange(val === "" ? 0 : Number(val));
            }}
            className="font-mono tabular-nums"
          />
        ),
      },
      {
        name: "closingDay",
        label: "Dia de fechamento",
        description: "Dia do mês em que a fatura fecha (1 a 31).",
        hidden: (values) => !values?.hasCustomClosingDay,
        children: (_ctx, field) => (
          <Input
            type="number"
            min={1}
            max={31}
            placeholder="Ex: 5"
            value={typeof field.value === "number" ? field.value : ""}
            onChange={(e) => {
              const val = e.target.value;
              field.onChange(val === "" ? null : Number(val));
            }}
            className="font-mono tabular-nums"
          />
        ),
      },
    ],
  },
];
