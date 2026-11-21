"use client";

import * as React from "react";
import { Wizard, WizardDrawerLayout } from "@/components/wizard";
import { cn } from "@/lib/utils";
import type { InstallmentFormValues } from "@/modules/installments/models/schemas/installment-form.schema";
import { buildInstallmentMobileSteps } from "./steps";
import type { InstallmentWizardProps } from "./types";

/** Wizard mobile (Drawer): um assunto por tela. */
export function InstallmentWizard({
  options,
  initialData,
  onSubmit,
  onClose,
  submitText,
  className,
}: InstallmentWizardProps) {
  const steps = React.useMemo(() => {
    const built = buildInstallmentMobileSteps(options);
    if (!submitText) return built;
    return built.map((step) =>
      step.id === "review" ? { ...step, submitText } : step
    );
  }, [options, submitText]);

  return (
    <div className={cn("w-full flex flex-col min-h-0 flex-1", className)}>
      <Wizard<InstallmentFormValues>
        steps={steps}
        initialData={initialData}
        onComplete={onSubmit}
        onClose={onClose}
        pruneInactive={true}
        className="flex flex-col min-h-0 flex-1"
      >
        <WizardDrawerLayout onClose={onClose} />
      </Wizard>
    </div>
  );
}

export { InstallmentDialogWizard } from "./dialog";
export * from "./types";
