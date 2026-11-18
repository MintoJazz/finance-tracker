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
import type { RecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import { buildRecurrenceDesktopSteps, buildRecurrenceEditDesktopSteps } from "./steps";
import type { RecurrenceWizardProps } from "./types";

function RecurrenceDialogFooter({
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
export function RecurrenceDialogWizard({
  options,
  initialData,
  onSubmit,
  onClose,
  submitText = "Criar recorrência",
  variant = "create",
  className,
}: RecurrenceWizardProps) {
  const steps = React.useMemo(
    () =>
      variant === "edit"
        ? buildRecurrenceEditDesktopSteps(options)
        : buildRecurrenceDesktopSteps(options),
    [options, variant]
  );

  return (
    <Wizard<RecurrenceFormValues>
      steps={steps}
      initialData={initialData}
      onComplete={onSubmit}
      onClose={onClose}
      pruneInactive={true}
      className={cn("flex min-h-0 flex-1 flex-col", className)}
    >
      <WizardDialogLayout
        hideProgressWhenSingle
        footer={<RecurrenceDialogFooter onClose={onClose} submitText={submitText} />}
      />
    </Wizard>
  );
}
