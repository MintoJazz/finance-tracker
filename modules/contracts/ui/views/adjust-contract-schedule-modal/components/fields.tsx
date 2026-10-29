import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ControlFirstLayout } from "@/components/form";
import { ContractCycleField } from "../../../components/contract-form/cycle-fields";
import type { FormField } from "@/types/form.types";
import type { AdjustContractScheduleFormValues } from "@/modules/contracts/models/adjust-contract-schedule-form.schema";
import type { ContractScheduleValues } from "@/modules/contracts/models/contract-form.schema";

const getScheduleFields = (): FormField<AdjustContractScheduleFormValues>[] => [
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

const getEffectiveScopeFields = (
  effectiveScope: AdjustContractScheduleFormValues["effectiveScope"],
  idPrefix = ""
): FormField<AdjustContractScheduleFormValues>[] => [
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
          <RadioGroupItem value="IMMEDIATE" id={`${idPrefix}schedule-immediate`} />
          <Label htmlFor={`${idPrefix}schedule-immediate`} className="text-sm font-normal cursor-pointer">
            A partir de agora
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="NEXT_CYCLE" id={`${idPrefix}schedule-next-cycle`} />
          <Label htmlFor={`${idPrefix}schedule-next-cycle`} className="text-sm font-normal cursor-pointer">
            A partir do próximo ciclo
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="SPECIFIC_DATE" id={`${idPrefix}schedule-specific-date`} />
          <Label htmlFor={`${idPrefix}schedule-specific-date`} className="text-sm font-normal cursor-pointer">
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
        } as FormField<AdjustContractScheduleFormValues>,
      ]
    : []),
];

export const getAdjustContractScheduleFields = (
  effectiveScope: AdjustContractScheduleFormValues["effectiveScope"],
  idPrefix = ""
): FormField<AdjustContractScheduleFormValues>[] => [
  ...getScheduleFields(),
  ...getEffectiveScopeFields(effectiveScope, idPrefix),
];

export const getAdjustContractScheduleFieldsStep1 =
  (): FormField<AdjustContractScheduleFormValues>[] => getScheduleFields();

export const getAdjustContractScheduleFieldsStep2 = (
  effectiveScope: AdjustContractScheduleFormValues["effectiveScope"]
): FormField<AdjustContractScheduleFormValues>[] =>
  getEffectiveScopeFields(effectiveScope, "mobile-");
