"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { ContractWizard } from "../../../components/contract-wizard";
import type { CreateContractModalProps } from "../types";

export default function CreateContractModalViewMobile({
  isOpen,
  initialValues,
  onSubmit,
  onClose,
  onOpenChangeComplete,
}: CreateContractModalProps) {
  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onOpenChangeComplete={onOpenChangeComplete}
      showSwipeHandle
    >
      <DrawerContent className="data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-calc(var(--drawer-inset,0px)*2))] max-h-[calc(100dvh-calc(var(--drawer-inset,0px)*2))]">
        <DrawerTitle className="sr-only">Novo Contrato</DrawerTitle>
        <DrawerDescription className="sr-only">
          Cadastre um compromisso financeiro recorrente em etapas simples.
        </DrawerDescription>
        <div className="flex flex-col min-h-0 flex-1 px-3.5 pt-1 pb-3">
          <ContractWizard
            initialData={initialValues}
            onSubmit={onSubmit}
            onClose={onClose}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
