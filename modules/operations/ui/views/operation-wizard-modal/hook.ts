"use client"

import { useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/toast"
import { executeOperationAction } from "../../actions/execute-operation.action"
import type { OperationDraft } from "../../../models/operation-input.schema"
import type {
  OperationWizardModalInput,
  OperationWizardModalProps,
} from "./types"

export function useOperationWizardModal(
  input?: OperationWizardModalInput
): OperationWizardModalProps {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(true)
  const hasNavigatedRef = useRef(false)

  const isControlled = input?.isOpen !== undefined
  const isOpen = isControlled ? Boolean(input.isOpen) : internalOpen

  const navigateBack = useCallback(() => {
    if (input?.onClose) {
      input.onClose()
      return
    }
    if (!hasNavigatedRef.current) {
      hasNavigatedRef.current = true
      if (typeof window !== "undefined" && window.history.length <= 1) {
        router.replace("/operations")
      } else {
        router.back()
      }
    }
  }, [input, router])

  const onClose = useCallback(() => {
    if (!isControlled) {
      setInternalOpen(false)
    }
    if (input?.onClose) {
      input.onClose()
      return
    }
    setTimeout(() => {
      navigateBack()
    }, 300)
  }, [isControlled, input, navigateBack])

  const onOpenChangeComplete = useCallback(
    (open: boolean) => {
      if (!open && !input?.onClose) {
        navigateBack()
      }
    },
    [input, navigateBack]
  )

  const onComplete = useCallback(
    async (payload: Partial<OperationDraft>) => {
      if (input?.onComplete) {
        await input.onComplete(payload)
        return
      }

      const result = await executeOperationAction({
        payload,
        seed: input?.seed,
      })

      if (!result.success) {
        toast.add({
          type: "error",
          priority: "high",
          title: "Erro ao registrar operação",
          description: result.error,
        })
        return
      }

      toast.add({
        type: "success",
        title: "Operação registrada",
        description: "O lançamento foi salvo com sucesso.",
      })
      router.refresh()
      onClose()
    },
    [input, onClose, router]
  )

  return {
    isOpen,
    seed: input?.seed,
    options: input?.options,
    onClose,
    onOpenChangeComplete,
    onComplete,
  }
}

