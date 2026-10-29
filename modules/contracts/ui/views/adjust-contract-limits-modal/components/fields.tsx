import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { MoneyInput } from "@/components/form/money-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { FormField } from "@/types/form.types";
import type { AdjustContractLimitsFormValues } from "@/modules/contracts/models/adjust-contract-limits-form.schema";

export const getAdjustContractLimitsFields = (
  effectiveScope: AdjustContractLimitsFormValues["effectiveScope"]
): FormField<AdjustContractLimitsFormValues>[] => [
  {
    name: "value",
    label: "Novo valor",
    children: (
      <MoneyInput
        placeholder="R$ 0,00"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono tabular-nums"
      />
    ),
  },
  {
    name: "effectiveScope",
    label: "Quando começa a valer",
    children: (_ctx, field) => (
      <RadioGroup
        value={field.value}
        onValueChange={(val: string) => {
          if (val === "IMMEDIATE" || val === "NEXT_CYCLE" || val === "SPECIFIC_DATE") {
            field.onChange(val);
          }
        }}
        className="grid gap-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="IMMEDIATE" id="limits-immediate" />
          <Label htmlFor="limits-immediate" className="text-sm font-normal cursor-pointer">
            A partir de agora
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="NEXT_CYCLE" id="limits-next-cycle" />
          <Label htmlFor="limits-next-cycle" className="text-sm font-normal cursor-pointer">
            A partir do próximo ciclo
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="SPECIFIC_DATE" id="limits-specific-date" />
          <Label htmlFor="limits-specific-date" className="text-sm font-normal cursor-pointer">
            Em data específica
          </Label>
        </div>
      </RadioGroup>
    ),
  },
  ...(effectiveScope === "SPECIFIC_DATE"
    ? [
        {
          name: "effectiveDate",
          label: "Data de vigência",
          children: (_ctx, field) => (
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  />
                }
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.value ? format(field.value as Date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={field.value as Date | undefined} onSelect={(date) => field.onChange(date ?? null)} />
              </PopoverContent>
            </Popover>
          ),
        } as FormField<AdjustContractLimitsFormValues>,
      ]
    : []),
];

export const getAdjustContractLimitsFieldsStep1 = (): FormField<AdjustContractLimitsFormValues>[] => [
  {
    name: "value",
    label: "Novo valor",
    children: (
      <MoneyInput
        placeholder="R$ 0,00"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono tabular-nums"
      />
    ),
  },
];

export const getAdjustContractLimitsFieldsStep2 = (
  effectiveScope: AdjustContractLimitsFormValues["effectiveScope"]
): FormField<AdjustContractLimitsFormValues>[] => [
  {
    name: "effectiveScope",
    label: "Quando começa a valer",
    children: (_ctx, field) => (
      <RadioGroup
        value={field.value}
        onValueChange={(val: string) => {
          if (val === "IMMEDIATE" || val === "NEXT_CYCLE" || val === "SPECIFIC_DATE") {
            field.onChange(val);
          }
        }}
        className="grid gap-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="IMMEDIATE" id="limits-mob-immediate" />
          <Label htmlFor="limits-mob-immediate" className="text-sm font-normal cursor-pointer">
            A partir de agora
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="NEXT_CYCLE" id="limits-mob-next-cycle" />
          <Label htmlFor="limits-mob-next-cycle" className="text-sm font-normal cursor-pointer">
            A partir do próximo ciclo
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="SPECIFIC_DATE" id="limits-mob-specific-date" />
          <Label htmlFor="limits-mob-specific-date" className="text-sm font-normal cursor-pointer">
            Em data específica
          </Label>
        </div>
      </RadioGroup>
    ),
  },
  ...(effectiveScope === "SPECIFIC_DATE"
    ? [
        {
          name: "effectiveDate",
          label: "Data de vigência",
          children: (_ctx, field) => (
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  />
                }
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.value ? format(field.value as Date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={field.value as Date | undefined} onSelect={(date) => field.onChange(date ?? null)} />
              </PopoverContent>
            </Popover>
          ),
        } as FormField<AdjustContractLimitsFormValues>,
      ]
    : []),
];
