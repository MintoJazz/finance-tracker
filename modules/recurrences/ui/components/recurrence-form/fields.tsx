import type * as React from "react";
import { useFormContext } from "react-hook-form";
import { ControlFirstLayout, DatePicker, MoneyInput } from "@/components/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type {
    FormField,
    FormFieldItem,
    FormFieldRow,
} from "@/types/form.types";
import type { RecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import {
    fromDateString,
    toDateString,
} from "@/modules/recurrences/ui/utils/recurrence-form.utils";
import { RecurrenceDayMonthPicker } from "./controls/day-month-picker";
import { RecurrenceFrequencyPills } from "./controls/frequency-pills";
import { RecurrenceFrequencySelect } from "./controls/frequency-select";
import { RecurrenceNaturePicker } from "./controls/nature-picker";
import { RecurrenceWeekdayPicker } from "./controls/weekday-picker";

type Direction = RecurrenceFormValues["direction"];
type Frequency = RecurrenceFormValues["frequency"];
type Item = FormFieldItem<RecurrenceFormValues>;
type Row = FormFieldRow<RecurrenceFormValues>;

const MONEY_INPUT_CLASS =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 font-mono text-base tabular-nums shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

/** Em linhas de 2 campos, mantém 2 colunas também no mobile (como no wizard). */
const KEEP_TWO_COLUMNS = "[&:has(>:nth-child(2))]:grid-cols-2";

export const natureField: Item = {
    name: "direction",
    label: "Natureza da recorrência",
    children: (_ctx, field) => (
        <RecurrenceNaturePicker value={field.value as Direction} onChange={field.onChange} />
    ),
};

export const createNameField = (
    placeholder: string,
    className?: string
): Item => ({
    name: "name",
    label: "Nome da recorrência",
    children: (
        <Input
            placeholder={placeholder}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            data-1p-ignore="true"
            data-lpignore="true"
            className={className}
        />
    ),
});

export const nameField: Item = createNameField("Digite o nome da recorrência");

export const amountField: Item = {
    name: "amount",
    label: "Valor recorrente",
    children: <MoneyInput placeholder="R$ 0,00" className={MONEY_INPUT_CLASS} />,
};

export const frequencySelectField: Item = {
    name: "frequency",
    label: "Frequência",
    children: (_ctx, field) => (
        <RecurrenceFrequencySelect value={field.value as Frequency} onChange={field.onChange} />
    ),
};

export const frequencyPillsField: Item = {
    name: "frequency",
    label: "Frequência",
    children: (_ctx, field) => (
        <RecurrenceFrequencyPills value={field.value as Frequency} onChange={field.onChange} />
    ),
};

export const startDateField: Item = {
    name: "startDate",
    label: "Data de início",
    children: (_ctx, field) => (
        <DatePicker
            value={fromDateString(field.value as string | null)}
            onChange={(date) => field.onChange(toDateString(date))}
            onBlur={field.onBlur}
        />
    ),
};

/* ------------------------------ Prazos ------------------------------ */

function DayNumberInput({
    value,
    onChange,
    ...props
}: Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> & {
    value: unknown;
    onChange: (v: number | "") => void;
}) {
    return (
        <Input
            type="number"
            min={1}
            max={31}
            step={1}
            value={typeof value === "number" && value > 0 ? value : ""}
            onChange={(e) => {
                const val = e.target.value;
                onChange(val === "" ? "" : Number(val));
            }}
            className="font-mono tabular-nums"
            {...props}
        />
    );
}

const isFreq =
    (...freqs: RecurrenceFormValues["frequency"][]) =>
    (values: RecurrenceFormValues) =>
        !freqs.includes(values.frequency);
const noClosing = (values: RecurrenceFormValues) =>
    !values.hasCustomClosingDate;

const customClosingField: Item = {
    name: "hasCustomClosingDate",
    label: "Data de fechamento diferente do vencimento",
    layout: ControlFirstLayout,
    children: (_ctx, field) => (
        <Checkbox
            checked={Boolean(field.value)}
            onCheckedChange={(checked) => field.onChange(Boolean(checked))}
            onBlur={field.onBlur}
        />
    ),
};

const monthlyRow: Row = {
    className: KEEP_TWO_COLUMNS,
    hidden: isFreq("MONTHLY"),
    row: [
        {
            name: "dueDay",
            label: "Dia de vencimento",
            children: (_ctx, field) => (
                <DayNumberInput
                    placeholder="Ex: 10"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                />
            ),
        },
        {
            name: "closingDay",
            label: "Dia de fechamento",
            hidden: noClosing,
            children: (_ctx, field) => (
                <DayNumberInput
                    placeholder="Ex: 5"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                />
            ),
        },
    ],
};

const weeklyFields: Item[] = [
    {
        name: "dueDay",
        label: "Dia de vencimento",
        hidden: isFreq("WEEKLY"),
        children: (_ctx, field) => (
            <RecurrenceWeekdayPicker value={field.value as number | null} onChange={field.onChange} />
        ),
    },
    {
        name: "closingDay",
        label: "Dia de fechamento",
        hidden: (v) => v.frequency !== "WEEKLY" || !v.hasCustomClosingDate,
        children: (_ctx, field) => (
            <RecurrenceWeekdayPicker value={field.value as number | null} onChange={field.onChange} />
        ),
    },
];

/** O erro de "mês" aparece no campo; dia e mês são gravados juntos. */
const yearlyRow: Row = {
    className: KEEP_TWO_COLUMNS,
    hidden: isFreq("YEARLY"),
    row: [
        {
            name: "dueMonth",
            label: "Data de vencimento (dia e mês)",
            children: (_ctx, field) => (
                <YearlyDueControl onChange={field.onChange} month={field.value as number | null} />
            ),
        },
        {
            name: "closingMonth",
            label: "Data de fechamento (dia e mês)",
            hidden: noClosing,
            children: (_ctx, field) => (
                <YearlyClosingControl onChange={field.onChange} month={field.value as number | null} />
            ),
        },
    ],
};

export const deadlineFields: FormField<RecurrenceFormValues>[] = [
    customClosingField,
    monthlyRow,
    ...weeklyFields,
    yearlyRow,
];

/* ----- Controles anuais: ligam o campo de mês ao dia via form context ----- */
function YearlyDueControl({
    month,
    onChange,
}: {
    month?: number | null;
    onChange: (v: number) => void;
}) {
    const { watch, setValue } = useFormContext<RecurrenceFormValues>();
    return (
        <RecurrenceDayMonthPicker
            day={watch("dueDay")}
            month={month}
            placeholder="Dia e mês"
            onChange={(d, m) => {
                setValue("dueDay", d, { shouldValidate: true });
                onChange(m);
            }}
        />
    );
}

function YearlyClosingControl({
    month,
    onChange,
}: {
    month?: number | null;
    onChange: (v: number) => void;
}) {
    const { watch, setValue } = useFormContext<RecurrenceFormValues>();
    return (
        <RecurrenceDayMonthPicker
            day={watch("closingDay")}
            month={month}
            placeholder="Dia e mês"
            onChange={(d, m) => {
                setValue("closingDay", d, { shouldValidate: true });
                onChange(m);
            }}
        />
    );
}
