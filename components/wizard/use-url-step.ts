"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

/**
 * Hook para sincronizar o passo atual do Wizard com a URL via query parameters no Next.js App Router.
 * Permite navegação pelas setas de voltar/avançar do navegador mantendo o estado sincronizado.
 */
export function useUrlStep(defaultStepId: string, paramName = "step") {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentStepId = searchParams.get(paramName) || defaultStepId

  const handleStepChange = useCallback(
    (newStepId: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(paramName, newStepId)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams, paramName]
  )

  return {
    stepId: currentStepId,
    onStepChange: handleStepChange,
  }
}
