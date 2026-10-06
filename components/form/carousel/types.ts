import type { ComponentProps, ReactNode, Ref } from "react"
import type { UseEmblaCarouselType } from "embla-carousel-react"
import type { Button } from "@/components/ui/button"

export type CarouselApi = UseEmblaCarouselType[1]

export interface CarouselOption<T = string> {
  value: T
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

type BaseBadgeCarouselProps<T = string> = {
  id?: string
  name?: string
  options: CarouselOption<T>[]
  onBlur?: () => void
  disabled?: boolean
  className?: string
  itemClassName?: string
  ref?: Ref<HTMLDivElement>
  "aria-invalid"?: boolean
  children?: ReactNode
}

export type BadgeCarouselProps<T = string> = BaseBadgeCarouselProps<T> &
  (
    | {
        multiple: true
        value?: T[] | null
        onChange?: (value: T[] | undefined) => void
      }
    | {
        multiple?: false
        value?: T | null
        onChange?: (value: T | undefined) => void
      }
  )

export interface BadgeCarouselContextValue<T = string> {
  options: CarouselOption<T>[]
  value?: T | T[] | null
  multiple: boolean
  disabled: boolean
  isSelected: (optionValue: T) => boolean
  handleToggle: (optionValue: T) => void
  itemClassName?: string
}

export type BadgeCarouselControlsProps = ComponentProps<"div">

export interface BadgeCarouselButtonProps
  extends Omit<ComponentProps<typeof Button>, "onClick" | "disabled"> {
  disabled?: boolean
}
