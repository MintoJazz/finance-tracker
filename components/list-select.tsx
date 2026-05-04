"use client"

import {
    Combobox,
    ComboboxContent,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"

export type ListItem = { id: number; name: string }

interface Props {
    value?: number | null
    onChange: (value: number | null) => void
    options: ListItem[]
    placeholder?: string
}

export default function ListSelect({ value, onChange, placeholder, options }: Props) {
    const selectedOption = options.find((item) => item.id === value)

    return (
        <Combobox
            items={options}
            onValueChange={(val) => onChange(val?.id ?? null)}
            itemToStringLabel={(item) => (item ? item.name : "")}
            value={selectedOption ?? null}
        >
            <ComboboxInput placeholder={placeholder || "Selecionar..."} showClear />
            <ComboboxContent className="z-1001 min-w-(--anchor-width)">
                <ComboboxList>
                    {(item) => (
                        <ComboboxItem key={item.id} value={item}>
                            {item.name}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}