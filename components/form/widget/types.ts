import type { ComponentProps, ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

export type WidgetValue = string | number

export interface WidgetBaseProps {
  disabled?: boolean
  className?: string
  children: ReactNode
}

export interface WidgetSingleProps<T extends WidgetValue = WidgetValue> extends WidgetBaseProps {
  multiple?: false
  value?: T | null
  onChange?: (value: T | null) => void
  allowDeselect?: boolean
}

export interface WidgetMultipleProps<T extends WidgetValue = WidgetValue> extends WidgetBaseProps {
  multiple: true
  value?: T[]
  onChange?: (value: T[]) => void
}

export type WidgetProps<T extends WidgetValue = WidgetValue> =
  | WidgetSingleProps<T>
  | WidgetMultipleProps<T>

export interface WidgetContextValue<T = WidgetValue> {
  multiple: boolean
  disabled: boolean
  isSelected: (val: T) => boolean
  toggle: (val: T) => void
}

export interface WidgetItemContextValue {
  value: WidgetValue
  selected: boolean
  disabled: boolean
}

export interface WidgetItemProps extends Omit<ComponentProps<"div">, "onSelect"> {
  value: WidgetValue
  disabled?: boolean
  children: ReactNode
}

export interface WidgetIconProps extends ComponentProps<"div"> {
  icon?: LucideIcon | ReactNode
}

export type WidgetListProps = ComponentProps<"div">
export type WidgetContentProps = ComponentProps<"div">
export type WidgetTitleProps = ComponentProps<"span">
export type WidgetSubtitleProps = ComponentProps<"span">
export type WidgetCheckboxProps = ComponentProps<"div">
export type WidgetExtraProps = ComponentProps<"div">
