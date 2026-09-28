import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

interface RecordSelectItemContentProps {
  label: string
  isSelected: boolean
  /** true = check à esquerda; false = check à direita */
  checkOnLeft: boolean
}

export function RecordSelectItemContent({
  label,
  isSelected,
  checkOnLeft,
}: RecordSelectItemContentProps) {
  const check = (
    <Check
      className={cn(
        "h-4 w-4",
        checkOnLeft ? "mr-2" : "ml-2",
        isSelected ? "opacity-100" : "opacity-0"
      )}
    />
  )

  if (checkOnLeft) {
    return (
      <>
        {check}
        {label}
      </>
    )
  }

  return (
    <div className="flex w-full items-center justify-between">
      <span>{label}</span>
      {check}
    </div>
  )
}