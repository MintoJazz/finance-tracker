"use client"
import { forwardRef } from "react"
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
    onChange?: (value: number | null) => void
    onBlur?: () => void
    name?: string
    options: ListItem[]
    placeholder?: string
}

const ListSelect = forwardRef<HTMLInputElement, Props>(
    ({ value, onChange, onBlur, name, placeholder, options }, ref) => {
        const selectedOption = options.find((item) => item.id === value)

        return (
            <Combobox items={options} onValueChange={(val) => onChange?.(val?.id ?? null)} itemToStringLabel={(item) => (item ? item.name : "")} value={selectedOption ?? null} >
                <ComboboxInput ref={ref} name={name} onBlur={onBlur} placeholder={placeholder || "Selecionar..."} showClear />
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
)

ListSelect.displayName = "ListSelect"
export default ListSelect