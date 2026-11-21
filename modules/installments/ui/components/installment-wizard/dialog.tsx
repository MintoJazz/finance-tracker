"use client";

import * as React from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Wizard,
  WizardDialogLayout,
  WizardNext,
  useWizard,
} from "@/components/wizard";
import { cn } from "@/lib/utils";
import type { InstallmentFormValues } from "@/modules/installments/models/schemas/installment-form.schema";
import { buildInstallmentDesktopSteps } from "./steps";
import type { InstallmentWizardProps } from "./types";

function InstallmentDialogFooter({
  onClose,
  submitText,
}: {
  onClose?: () => void;
  submitText: string;
}) {
  const { isFirst, isLast, isSubmitting, back } = useWizard();

  return (
    <DialogFooter className="-mx-5 -mb-5 mt-auto flex-row justify-end gap-2 border-t border-border/60 bg-muted/30 px-5 py-3 rounded-b-xl">
      <Button
        type="button"
        variant="outline"
        onClick={isFirst ? onClose : back}
        disabled={isSubmitting}
      >
        {isFirst ? "Cancelar" : "Voltar"}
      </Button>
      <WizardNext>{isLast ? submitText : "Continuar"}</WizardNext>
    </DialogFooter>
  );
}

/**
 * Wizard desktop (dentro de um Dialog): começa com um único passo e ganha
 * os passos "Nova categoria"/"Nova subcategoria" quando o usuário escolhe criar.
 */
export function InstallmentDialogWizard({
  options,
  initialData,
  onSubmit,
  onClose,
  submitText = "Criar parcelamento",
  className,
}: InstallmentWizardProps) {
  const steps = React.useMemo(
    () => buildInstallmentDesktopSteps(options),
    [options]
  );

  return (
    <Wizard<InstallmentFormValues>
      steps={steps}
      initialData={initialData}
      onComplete={onSubmit}
      onClose={onClose}
      pruneInactive={true}
      className={cn("flex min-h-0 flex-1 flex-col", className)}
    >
      <WizardDialogLayout
        hideProgressWhenSingle
        footer={
          <InstallmentDialogFooter onClose={onClose} submitText={submitText} />
        }
      />
    </Wizard>
  );
}
