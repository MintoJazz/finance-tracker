import {
    BadgeCarousel,
    BadgeCarouselContent,
    BadgeCarouselControls,
    MoneyInput,
} from "@/components/form";
import { Input } from "@/components/ui/input";
import type { FormField } from "@/types/form.types";
import type { CardFormValues } from "@/modules/account/core/schemas/card.schema";

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    return {
        value: day,
        label: `Dia ${day}`,
    };
});

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
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-mono tabular-nums"
            />
        ),
    },
    {
        name: "closingDay",
        label: "Dia de fechamento",
        description: "Dia do mês em que a fatura fecha.",
        children: (
            <BadgeCarousel<number> options={DAY_OPTIONS}>
                <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1 overflow-hidden">
                        <BadgeCarouselContent />
                    </div>
                    <BadgeCarouselControls className="shrink-0" />
                </div>
            </BadgeCarousel>
        ),
    },
    {
        name: "dueDay",
        label: "Dia de vencimento",
        description: "Dia do mês em que a fatura vence.",
        children: (
            <BadgeCarousel<number> options={DAY_OPTIONS}>
                <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1 overflow-hidden">
                        <BadgeCarouselContent />
                    </div>
                    <BadgeCarouselControls className="shrink-0" />
                </div>
            </BadgeCarousel>
        ),
    },
];