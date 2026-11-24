"use client";

import * as React from "react";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import type { InstallmentCard } from "@/modules/installments/models/schemas/installment-item.schema";

interface Props {
    id?: string;
    "aria-invalid"?: boolean;
    cards: InstallmentCard[];
    value?: number | null;
    onChange: (value: number | null) => void;
    onBlur?: () => void;
    placeholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
}

const norm = (s: string) =>
    s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

/** Combobox de seleção do cartão cuja fatura receberá as parcelas. */
export function InstallmentCardCombobox({
    id,
    "aria-invalid": ariaInvalid,
    cards,
    value,
    onChange,
    onBlur,
    placeholder = "Buscar cartão",
    emptyMessage = "Nenhum cartão encontrado",
    disabled,
}: Props) {
    const selected = React.useMemo(
        () => cards.find((c) => c.id === value) ?? null,
        [cards, value]
    );

    const [query, setQuery] = React.useState(selected?.name ?? "");

    // Mantém o texto do input alinhado ao valor quando ele muda por fora
    const selectedKey = selected ? `${selected.id}:${selected.name}` : "";
    const [prevSelectedKey, setPrevSelectedKey] = React.useState(selectedKey);
    if (prevSelectedKey !== selectedKey) {
        setPrevSelectedKey(selectedKey);
        setQuery(selected?.name ?? "");
    }

    const items = React.useMemo(() => {
        const q = norm(query);
        const showAll = !q || (selected != null && q === norm(selected.name));
        return showAll ? cards : cards.filter((c) => norm(c.name).includes(q));
    }, [cards, query, selected]);

    return (
        <Combobox<InstallmentCard>
            items={items}
            filter={null}
            value={selected}
            inputValue={query}
            onInputValueChange={(next) => setQuery(next)}
            itemToStringLabel={(item) => item.name}
            isItemEqualToValue={(a, b) => a.id === b.id}
            disabled={disabled}
            onValueChange={(item) => onChange(item ? item.id : null)}
        >
            <ComboboxInput
                id={id}
                aria-invalid={ariaInvalid}
                placeholder={placeholder}
                showClear={selected != null}
                className="h-9 w-full"
                disabled={disabled}
                onBlur={onBlur}
            />
            <ComboboxContent>
                <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
                <ComboboxList>
                    {(card: InstallmentCard) => (
                        <ComboboxItem key={card.id} value={card}>
                            <span className="truncate">{card.name}</span>
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
