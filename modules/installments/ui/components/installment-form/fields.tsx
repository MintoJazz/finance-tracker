"use client";

import * as React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { DatePicker, MoneyInput } from "@/components/form";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/formatters";
import type { FormFieldItem, FormFieldRow } from "@/types/form.types";
import {
    MAX_INSTALLMENTS,
    MIN_INSTALLMENTS,
    type InstallmentFormValues,
} from "@/modules/installments/models/schemas/installment-form.schema";
import type { InstallmentFormOptions } from "@/modules/installments/models/schemas/installment-form-options.schema";
import {
    computeInstallmentAmount,
    fromDateString,
    toDateString,
} from "@/modules/installments/ui/utils/installment-form.utils";
import { InstallmentCardSelect } from "./controls/card-select";
import { InstallmentTypePicker } from "./controls/type-picker";

type Item = FormFieldItem<InstallmentFormValues>;
type Row = FormFieldRow<InstallmentFormValues>;
type Type = InstallmentFormValues["type"];

const MONEY_INPUT_CLASS =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 font-mono text-base tabular-nums shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

/** Grade padrão das linhas: 2 colunas de mesma largura e o mesmo gap, também no mobile. */
export const ROW_CLASS = "grid-cols-2 gap-3";

/**
 * Como `ROW_CLASS`, mas com um único campo visível ele ocupa a largura toda
 * (ex.: vencimento da 1ª parcela no "mês a mês", sem cartão).
 */
const ROW_CLASS_FILL = "grid-cols-1 gap-3 [&:has(>:nth-child(2))]:grid-cols-2";

const isNotType =
    (type: Type) =>
    (values: InstallmentFormValues) =>
        values.type !== type;

/** Trocar para "mês a mês" descarta o cartão, que deixa de valer. */
function TypeControl({
    value,
    onChange,
}: {
    value?: Type;
    onChange: (value: Type) => void;
}) {
    const { setValue } = useFormContext<InstallmentFormValues>();
    return (
        <InstallmentTypePicker
            value={value}
            onChange={(next) => {
                if (next === "MONTHLY") setValue("cardId", null);
                onChange(next);
            }}
        />
    );
}

export const typeField: Item = {
    name: "type",
    label: "Forma de pagamento",
    children: (_ctx, field) => (
        <TypeControl value={field.value as Type} onChange={field.onChange} />
    ),
};

/** Sem rótulo (o radiogroup já tem aria-label): economiza uma linha de altura no desktop. */
export const compactTypeField: Item = { ...typeField, label: undefined };

export const createNameField = (
    placeholder: string,
    className?: string
): Item => ({
    name: "name",
    label: "Nome do parcelamento",
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

export const nameField: Item = createNameField("Ex: iPhone, Geladeira, Notebook...");

export const totalAmountField: Item = {
    name: "totalAmount",
    label: "Valor total da compra",
    children: <MoneyInput placeholder="R$ 0,00" className={MONEY_INPUT_CLASS} />,
};

/** Valor aproximado de cada parcela, calculado a partir do total e do nº de parcelas. */
function InstallmentAmountHint() {
    const [total, count] = useWatch<
        InstallmentFormValues,
        ["totalAmount", "totalInstallments"]
    >({ name: ["totalAmount", "totalInstallments"] });
    const amount = computeInstallmentAmount(total, count);
    return (
        <>
            {count}x de{" "}
            <span className="font-mono tabular-nums">{formatMoney(amount)}</span>
        </>
    );
}

export const totalInstallmentsField: Item = {
    name: "totalInstallments",
    label: "Nº de parcelas",
    children: (_ctx, field) => (
        <Input
            type="number"
            min={MIN_INSTALLMENTS}
            max={MAX_INSTALLMENTS}
            step={1}
            placeholder="Ex: 12"
            value={typeof field.value === "number" && field.value > 0 ? field.value : ""}
            onChange={(e) =>
                field.onChange(e.target.value === "" ? "" : Number(e.target.value))
            }
            onBlur={field.onBlur}
            className="font-mono tabular-nums"
        />
    ),
};

/** Variante com o valor de cada parcela abaixo do campo (telas de uma coluna, sem desalinhar a grade). */
export const totalInstallmentsFieldWithHint: Item = {
    ...totalInstallmentsField,
    description: <InstallmentAmountHint />,
};

const dateControl = (field: {
    value: unknown;
    onChange: (v: unknown) => void;
    onBlur: () => void;
}) => (
    <DatePicker
        value={fromDateString(field.value as string | null)}
        onChange={(date) => field.onChange(toDateString(date))}
        onBlur={field.onBlur}
    />
);

/** Fatura: data da compra. */
export const purchaseDateField: Item = {
    name: "purchaseDate",
    label: "Data da compra",
    hidden: isNotType("INVOICE"),
    children: (_ctx, field) => dateControl(field),
};

/** Mês a mês: vencimento da primeira parcela (as demais seguem mês a mês). */
export const firstDueDateField: Item = {
    name: "purchaseDate",
    label: "Vencimento da 1ª parcela",
    hidden: isNotType("MONTHLY"),
    children: (_ctx, field) => dateControl(field),
};

export function createCardField(options: InstallmentFormOptions): Item {
    return {
        name: "cardId",
        label: "Cartão",
        hidden: isNotType("INVOICE"),
        children: (_ctx, field) => (
            <InstallmentCardSelect
                cards={options.cards}
                value={field.value as number | null}
                onChange={field.onChange}
            />
        ),
    };
}

export function createPaymentRow(options: InstallmentFormOptions): Row {
    return {
        className: ROW_CLASS_FILL,
        row: [purchaseDateField, firstDueDateField, createCardField(options)],
    };
}

export const valuesRow: Row = {
    className: ROW_CLASS,
    row: [totalAmountField, totalInstallmentsField],
};
