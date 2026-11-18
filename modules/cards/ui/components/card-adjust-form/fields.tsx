import { MoneyInput } from "@/components/form";
import { Input } from "@/components/ui/input";
import type { FormField } from "@/types/form.types";
import type {
    CardDeadlinesAdjustmentValues,
    CardLimitAdjustmentValues,
} from "@/modules/cards/models/card-adjustment.schema";

function DayInput({
    value,
    onChange,
    placeholder,
}: {
    value: unknown;
    onChange: (v: number | "") => void;
    placeholder: string;
}) {
    return (
        <Input
            type="number"
            min={1}
            max={31}
            step={1}
            placeholder={placeholder}
            value={typeof value === "number" && value > 0 ? value : ""}
            onChange={(e) => {
                const val = e.target.value;
                onChange(val === "" ? "" : Number(val));
            }}
            className="font-mono tabular-nums"
        />
    );
}

/** Limite do cartão -> AgreementAmountEntry. */
export const cardLimitAdjustFields: FormField<CardLimitAdjustmentValues>[] = [
    {
        name: "amount",
        label: "Novo limite",
        children: (
            <MoneyInput
                placeholder="R$ 0,00"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm font-semibold shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono tabular-nums"
            />
        ),
    },
];

/** Ciclo da fatura -> CycleRule (mensal; fechamento obrigatório). */
export const cardDeadlinesAdjustFields: FormField<CardDeadlinesAdjustmentValues>[] = [
    {
        name: "dueDay",
        label: "Dia de vencimento",
        description: "Dia do mês em que a fatura vence (1 a 31).",
        children: (_ctx, field) => (
            <DayInput placeholder="Ex: 10" value={field.value} onChange={field.onChange} />
        ),
    },
    {
        name: "closingDay",
        label: "Dia de fechamento",
        description: "Dia do mês em que a fatura fecha (1 a 31).",
        children: (_ctx, field) => (
            <DayInput placeholder="Ex: 1" value={field.value} onChange={field.onChange} />
        ),
    },
];
