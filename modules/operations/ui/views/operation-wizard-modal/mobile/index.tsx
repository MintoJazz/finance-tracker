"use client"

import * as React from "react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  OperationWizardContent,
  OperationWizardProvider,
} from "@/modules/operations/ui/components/operation-wizard"
import type { OperationWizardModalProps } from "../types"

export default function OperationWizardModalViewMobile({
  isOpen,
  seed,
  options,
  onClose,
  onOpenChangeComplete,
  onComplete,
}: OperationWizardModalProps) {
  const content = (
    <OperationWizardContent
      viewport="mobile"
      onComplete={onComplete}
      onClose={onClose}
    />
  )

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
          {options ? (
            <OperationWizardProvider lookups={options} seed={seed}>
              {content}
            </OperationWizardProvider>
          ) : (
            content
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
