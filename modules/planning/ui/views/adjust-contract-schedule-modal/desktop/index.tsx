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
import type { AdjustContractScheduleModalProps } from "../types";
import { getAdjustContractScheduleFields } from "../components/fields";

export default function AdjustContractScheduleModalViewDesktop({
  isOpen,
  onClose,
  onOpenChangeComplete,
  form,
  onSubmit,
  isSubmitting,
  contractName,
}: AdjustContractScheduleModalProps) {
  const effectiveScope = form.watch("effectiveScope");
  const fields = React.useMemo(
    () => getAdjustContractScheduleFields(effectiveScope),
    [effectiveScope]
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <DialogContent className="sm:max-w-lg max-h-[calc(100dvh-2rem)] flex flex-col gap-4 overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Ajustar prazos</DialogTitle>
          <DialogDescription>
            Ajuste o vencimento e o fechamento{contractName ? ` de ${contractName}` : ""}. Defina quando começa a valer.
          </DialogDescription>
        </DialogHeader>
        <DataForm
          id="adjust-contract-schedule-form"
          form={form}
          fields={fields}
          onSubmit={onSubmit}
          className="min-h-0 flex-1"
          footer={
            <DialogFooter className="-mx-4 -mb-4 mt-auto">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" form="adjust-contract-schedule-form" disabled={isSubmitting}>
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
