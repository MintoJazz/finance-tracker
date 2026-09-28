"use client"

import { forwardRef } from "react"

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

import type { ListItem, ListSelectProps } from "./types"

const ListSelect = forwardRef<HTMLInputElement, ListSelectProps>(
  ({ value, onChange, onBlur, name, placeholder, options }, ref) => {
    const selectedOption = options.find((item) => item.id === value) ?? null

    return (
      <Combobox<ListItem>
        items={options}
        value={selectedOption}
        onValueChange={(val) => onChange?.(val?.id ?? null)}
        itemToStringLabel={(item) => (item ? item.name : "")}
      >
        <ComboboxInput
          ref={ref}
          name={name}
          onBlur={onBlur}
          placeholder={placeholder || "Selecionar..."}
          showClear
        />
        <ComboboxContent className="z-1001 min-w-(--anchor-width)">
          <ComboboxList>
            {(item: ListItem) => (
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