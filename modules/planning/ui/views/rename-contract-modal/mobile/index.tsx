"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { DataForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { RenameContractModalProps } from "../types";
import { renameContractFields } from "../components/fields";

export default function RenameContractModalViewMobile({
  isOpen,
  onClose,
  onOpenChangeComplete,
  form,
  onSubmit,
  isSubmitting,
}: RenameContractModalProps) {
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
        <DrawerHeader className="text-left">
          <DrawerTitle>Renomear contrato</DrawerTitle>
          <DrawerDescription>Atualize o nome do contrato.</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col min-h-0 flex-1 px-4">
          <DataForm
            id="rename-contract-form-mobile"
            form={form}
            fields={renameContractFields}
            onSubmit={onSubmit}
            footer={
              <DrawerFooter className="px-0 pt-2">
                <Button type="submit" form="rename-contract-form-mobile" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="animate-spin" data-icon="inline-start" />}
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancelar
                </Button>
              </DrawerFooter>
            }
            className="flex flex-col min-h-0 flex-1"
            contentClassName="flex-1"
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
