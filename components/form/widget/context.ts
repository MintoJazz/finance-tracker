"use client"

import * as React from "react"
import type { WidgetContextValue, WidgetItemContextValue, WidgetValue } from "./types"

export const WidgetContext = React.createContext<WidgetContextValue<unknown> | null>(null)
export const WidgetItemContext = React.createContext<WidgetItemContextValue | null>(null)

export function useWidgetContext<T extends WidgetValue = WidgetValue>() {
  const context = React.useContext(WidgetContext)
  if (!context) {
    throw new Error("Widget compound components must be rendered inside a <Widget> provider.")
  }
  return context as unknown as WidgetContextValue<T>
}

export function useWidgetItemContext() {
  const context = React.useContext(WidgetItemContext)
  if (!context) {
    throw new Error("WidgetItem subcomponents must be rendered inside a <WidgetItem>.")
  }
  return context
}
