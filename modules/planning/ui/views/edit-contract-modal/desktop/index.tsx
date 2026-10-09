"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ContractForm } from "../../../components/contract-form";
import type { EditContractModalProps } from "../types";

export default function EditContractModalViewDesktop({
  isOpen,
  form,
  onSubmit,
  onClose,
  onOpenChangeComplete,
  isSubmitting,
}: EditContractModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Contrato</DialogTitle>
          <DialogDescription>
            Atualize as informações, valores e datas deste compromisso recorrente.
          </DialogDescription>
        </DialogHeader>
        <ContractForm
          form={form}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          submitText="Salvar alterações"
          submitLoadingText="Salvando..."
        />
      </DialogContent>
    </Dialog>
  );
}
