"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CardFormSchema,
  type CardFormValues,
} from "@/modules/cards/models/card.schema"
import { toast } from "@/components/ui/toast"
import { updateCardAction } from "../../actions/update-card.action"
import type { EditCardModalInput, EditCardModalProps } from "./types"

export function useEditCardModal(
  input?: EditCardModalInput
): EditCardModalProps {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasNavigatedRef = useRef(false)

  const initialValues: CardFormValues = {
    name: input?.defaultValues?.name ?? "",
    limit: input?.defaultValues?.limit ?? 0,
    closingDay: input?.defaultValues?.closingDay ?? 1,
    dueDay: input?.defaultValues?.dueDay ?? 10,
  }

  const form = useForm<CardFormValues>({
    resolver: zodResolver(CardFormSchema),
    defaultValues: initialValues,
    values: input?.defaultValues ? initialValues : undefined,
  })

  const navigateBack = useCallback(() => {
    if (!hasNavigatedRef.current) {
      hasNavigatedRef.current = true
      router.back()
    }
  }, [router])

  const onClose = useCallback(() => {
    setIsOpen(false)
    setTimeout(() => {
      navigateBack()
    }, 300)
  }, [navigateBack])

  const onOpenChangeComplete = useCallback(
    (open: boolean) => {
      if (!open) {
        navigateBack()
      }
    },
    [navigateBack]
  )

  const onSubmit = async (data: CardFormValues) => {
    if (!input?.id) {
      toast.add({
        type: "error",
        title: "Erro ao atualizar cartão",
        description: "Identificador do cartão não encontrado.",
        priority: "high",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateCardAction({
        id: input.id,
        name: data.name,
        limit: data.limit,
        closingDay: data.closingDay,
        dueDay: data.dueDay,
      })

      if (!result.success) {
        setIsSubmitting(false)
        toast.add({
          type: "error",
          title: "Erro ao atualizar cartão",
          description: result.error ?? "Não foi possível atualizar o cartão.",
          priority: "high",
        })
        return
      }

      toast.add({
        type: "success",
        title: "Cartão atualizado",
        description: `O cartão "${data.name}" foi atualizado com sucesso.`,
      })

      onClose()
    } catch (error) {
      setIsSubmitting(false)
      console.error("[useEditCardModal] Falha ao atualizar cartão:", error)
      toast.add({
        type: "error",
        title: "Erro inesperado",
        description: "Ocorreu um erro interno. Tente novamente mais tarde.",
        priority: "high",
      })
    }
  }

  return {
    isOpen,
    isSubmitting,
    form,
    onSubmit,
    onClose,
    onOpenChangeComplete,
  }
}
