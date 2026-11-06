"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { OperationWizardContent } from "@/modules/operations/ui/components/operation-wizard"
import type { OperationWizardModalProps } from "../types"

export default function OperationWizardModalViewDesktop({
  isOpen,
  onClose,
  onOpenChangeComplete,
  onComplete,
}: OperationWizardModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <DialogContent className="sm:max-w-160 md:max-w-2xl max-h-[88dvh] flex flex-col overflow-hidden p-5 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Nova Operação Financeira</DialogTitle>
          <DialogDescription>
            Preencha os passos da operação financeira.
          </DialogDescription>
        </DialogHeader>

        <OperationWizardContent
          viewport="desktop"
          onComplete={onComplete}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
