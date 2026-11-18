"use client"

import * as React from "react"
import { DEFAULT_GLOBAL_ACTIONS } from "./default-actions"
import type { GlobalAction } from "./types"

interface GlobalActionsControls {
  register: (sourceId: string, actions: GlobalAction[]) => void
  unregister: (sourceId: string) => void
}

interface GlobalActionsContextValue {
  /** Ações visíveis: as padrão (pagar/receber) primeiro, depois as da página na ordem registrada. */
  actions: GlobalAction[]
}

// Dois contextos: quem registra ações (páginas) não deve re-renderizar
// quando a lista muda, senão ações recriadas a cada render gerariam loop.
const GlobalActionsContext =
  React.createContext<GlobalActionsContextValue | null>(null)
const GlobalActionsControlsContext =
  React.createContext<GlobalActionsControls | null>(null)

export function GlobalActionsProvider({
  children,
  defaultActions = DEFAULT_GLOBAL_ACTIONS,
}: {
  children: React.ReactNode
  defaultActions?: GlobalAction[]
}) {
  const [registered, setRegistered] = React.useState<
    Record<string, GlobalAction[]>
  >({})

  const register = React.useCallback(
    (sourceId: string, actions: GlobalAction[]) =>
      setRegistered((prev) => ({ ...prev, [sourceId]: actions })),
    []
  )

  const unregister = React.useCallback(
    (sourceId: string) =>
      setRegistered((prev) => {
        if (!(sourceId in prev)) return prev
        const rest = { ...prev }
        delete rest[sourceId]
        return rest
      }),
    []
  )

  const actions = React.useMemo(() => {
    const registeredActions = Object.values(registered).flat()
    const defaultIds = new Set(defaultActions.map((action) => action.id))
    const overrides = new Map(
      registeredActions
        .filter((action) => defaultIds.has(action.id))
        .map((action) => [action.id, action])
    )

    // Uma página pode "sobrescrever" uma ação padrão (ex.: Receber com a carteira
    // pré-selecionada): mantém a aparência da padrão e troca apenas o comportamento.
    const merged = defaultActions.map((action) => {
      const override = overrides.get(action.id)
      if (!override) return action
      return {
        ...action,
        href: override.href,
        onClick: override.onClick,
        disabled: override.disabled,
        hidden: override.hidden ?? action.hidden,
      }
    })
    const extra = registeredActions.filter((action) => !defaultIds.has(action.id))

    return [...merged, ...extra].filter((action) => !action.hidden)
  }, [registered, defaultActions])

  const value = React.useMemo(() => ({ actions }), [actions])
  const controls = React.useMemo(
    () => ({ register, unregister }),
    [register, unregister]
  )

  return (
    <GlobalActionsControlsContext.Provider value={controls}>
      <GlobalActionsContext.Provider value={value}>
        {children}
      </GlobalActionsContext.Provider>
    </GlobalActionsControlsContext.Provider>
  )
}

export function useGlobalActionsContext() {
  const ctx = React.useContext(GlobalActionsContext)
  if (!ctx) {
    throw new Error(
      "useGlobalActionsContext deve ser usado dentro de GlobalActionsProvider"
    )
  }
  return ctx
}

/** Registra ações da página atual; removidas automaticamente ao desmontar. */
export function useGlobalActions(actions: GlobalAction[]) {
  const controls = React.useContext(GlobalActionsControlsContext)
  if (!controls) {
    throw new Error("useGlobalActions deve ser usado dentro de GlobalActionsProvider")
  }
  const { register, unregister } = controls
  const sourceId = React.useId()

  React.useEffect(() => {
    register(sourceId, actions)
  }, [register, sourceId, actions])

  React.useEffect(() => () => unregister(sourceId), [unregister, sourceId])
}
