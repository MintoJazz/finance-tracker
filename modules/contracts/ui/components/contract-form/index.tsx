"use client";

import * as React from "react";
import { DataForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { ContractFormProps } from "./types";
import { contractFormFields } from "./fields";
import { DialogFooter } from "@/components/ui/dialog";

export function ContractForm({
  form,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitText = "Salvar contrato",
  submitLoadingText = "Salvando...",
}: ContractFormProps) {
  return (
    <DataForm
      id="contract-form"
      form={form}
      fields={contractFormFields}
      onSubmit={onSubmit}
      footer={
        <DialogFooter 
        >
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="contract-form"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            )}
            {isSubmitting ? submitLoadingText : submitText}
          </Button>
        </DialogFooter>
      }
    />
  );
}

export * from "./fields";
export * from "./types";
