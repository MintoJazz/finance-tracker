import { MoneyInput } from "@/components/form";
import type { FormField } from "@/types/form.types";
import type { RecurrenceAmountAdjustmentValues } from "@/modules/recurrences/models/schemas/recurrence-adjustment.schema";

const MONEY_INPUT_CLASS =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 font-mono text-base tabular-nums shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

/** Valor esperado da recorrência -> AgreementAmountEntry (o motivo opcional não aparece no design atual). */
export const recurrenceAmountAdjustFields: FormField<RecurrenceAmountAdjustmentValues>[] =
    [
        {
            name: "amount",
            label: "Novo valor",
            children: <MoneyInput placeholder="R$ 0,00" className={MONEY_INPUT_CLASS} />,
        },
    ];
