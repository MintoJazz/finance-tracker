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
import type { CreateContractModalProps } from "../types";

export default function CreateContractModalViewDesktop({
  isOpen,
  form,
  onSubmit,
  onClose,
  onOpenChangeComplete,
  isSubmitting,
}: CreateContractModalProps) {
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
          <DialogTitle>Novo Contrato</DialogTitle>
          <DialogDescription>
            Cadastre um compromisso financeiro recorrente para acompanhar pagamentos e projeções.
          </DialogDescription>
        </DialogHeader>
        <ContractForm
          form={form}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          submitText="Criar contrato"
          submitLoadingText="Criando..."
        />
      </DialogContent>
    </Dialog>
  );
}
