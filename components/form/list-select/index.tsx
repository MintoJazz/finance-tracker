"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import type { ListItem, ListSelectProps } from "./types"

export function ListSelect({
  id,
  "aria-invalid": ariaInvalid,
  value,
  onChange,
  onBlur,
  name,
  placeholder,
  options,
  className,
  ref,
  ...props
}: ListSelectProps) {
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
        id={id}
        aria-invalid={ariaInvalid}
        name={name}
        onBlur={onBlur}
        placeholder={placeholder || "Selecionar..."}
        showClear
        className={className}
        {...props}
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