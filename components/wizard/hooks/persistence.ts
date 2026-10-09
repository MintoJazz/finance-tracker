"use client"

import { useCallback, useEffect, useState } from "react"

export interface WizardStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

export interface UseWizardPersistenceOptions {
  storage?: WizardStorage
}

export interface WizardPersistedState<TData = any> {
  data: Partial<TData>
  stepId: string
}

function dateReviver(_key: string, value: any) {
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(value)
  ) {
    const d = new Date(value)
    if (!isNaN(d.getTime())) {
      return d
    }
  }
  return value
}

/**
 * Hook de persistência em sessionStorage para manter rascunhos de progresso e etapa do Wizard.
 */
export function useWizardPersistence<TData = any>(
  key: string,
  options?: UseWizardPersistenceOptions
) {
  const [initialData, setInitialData] = useState<Partial<TData> | undefined>(undefined)
  const [initialStepId, setInitialStepId] = useState<string | undefined>(undefined)
  const [isHydrated, setIsHydrated] = useState(false)

  const getStorage = useCallback((): WizardStorage | null => {
    if (options?.storage) return options.storage
    if (typeof window === "undefined") return null
    try {
      return window.sessionStorage
    } catch {
      return null
    }
  }, [options?.storage])

  // Restaura dados na montagem do componente (Client-Side)
  useEffect(() => {
    const storage = getStorage()
    if (storage) {
      try {
        const item = storage.getItem(key)
        if (item) {
          const parsed = JSON.parse(item, dateReviver) as WizardPersistedState<TData>
          if (parsed && typeof parsed === "object") {
            if (parsed.data) setInitialData(parsed.data)
            if (parsed.stepId) setInitialStepId(parsed.stepId)
          }
        }
      } catch (err) {
        console.warn(`[useWizardPersistence] Falha ao recuperar chave "${key}":`, err)
      }
    }
    setIsHydrated(true)
  }, [key, getStorage])

  // Callback para ser passado ao `onChange` do Wizard
  const handleChange = useCallback(
    (state: { data: Partial<TData>; stepId: string }) => {
      const storage = getStorage()
      if (storage) {
        try {
          storage.setItem(key, JSON.stringify(state))
        } catch (err) {
          console.warn(`[useWizardPersistence] Falha ao salvar chave "${key}":`, err)
        }
      }
    },
    [key, getStorage]
  )

  // Limpa o storage ao concluir o formulário
  const clear = useCallback(() => {
    const storage = getStorage()
    if (storage) {
      try {
        storage.removeItem(key)
      } catch (err) {
        console.warn(`[useWizardPersistence] Falha ao limpar chave "${key}":`, err)
      }
    }
  }, [key, getStorage])

  return {
    initialData,
    initialStepId,
    isHydrated,
    onChange: handleChange,
    clear,
  }
}
