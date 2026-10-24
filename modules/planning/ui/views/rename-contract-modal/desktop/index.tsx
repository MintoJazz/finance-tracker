"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { RenameContractModalProps } from "../types";
import { renameContractFields } from "../components/fields";

export default function RenameContractModalViewDesktop({
  isOpen,
  onClose,
  onOpenChangeComplete,
  form,
  onSubmit,
  isSubmitting,
}: RenameContractModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <DialogContent className="sm:max-w-md max-h-[calc(100dvh-2rem)] flex flex-col gap-4">
        <DialogHeader className="shrink-0">
          <DialogTitle>Renomear contrato</DialogTitle>
          <DialogDescription>Atualize o nome do contrato.</DialogDescription>
        </DialogHeader>
        <DataForm
          id="rename-contract-form"
          form={form}
          fields={renameContractFields}
          onSubmit={onSubmit}
          footer={
            <DialogFooter className="-mx-4 -mb-4 mt-auto">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" form="rename-contract-form" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" data-icon="inline-start" />}
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
