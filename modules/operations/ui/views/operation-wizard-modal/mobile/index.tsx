"use client"

import * as React from "react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer"
import { OperationWizardContent } from "@/modules/operations/ui/components/operation-wizard"
import type { OperationWizardModalProps } from "../types"

export default function OperationWizardModalViewMobile({
  isOpen,
  onClose,
  onOpenChangeComplete,
  onComplete,
}: OperationWizardModalProps) {
  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      onOpenChangeComplete={onOpenChangeComplete}
      showSwipeHandle
    >
      <DrawerContent className="data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-calc(var(--drawer-inset,0px)*2))] max-h-[calc(100dvh-calc(var(--drawer-inset,0px)*2))]">
        <DrawerTitle className="sr-only">Nova Operação Financeira</DrawerTitle>
        <DrawerDescription className="sr-only">
          Preencha os passos da operação financeira.
        </DrawerDescription>

        <div className="flex flex-col min-h-0 flex-1 px-3.5 pt-1 pb-3">
          <OperationWizardContent
            viewport="mobile"
            onComplete={onComplete}
            onClose={onClose}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
