"use client";

import * as React from "react";
import { Wizard, WizardDrawerLayout } from "@/components/wizard";
import { cn } from "@/lib/utils";
import type { RecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import { buildRecurrenceMobileSteps } from "./steps";
import type { RecurrenceWizardProps } from "./types";

/** Wizard mobile (Drawer): um assunto por tela. */
export function RecurrenceWizard({
  options,
  initialData,
  onSubmit,
  onClose,
  submitText,
  className,
}: RecurrenceWizardProps) {
  const steps = React.useMemo(() => {
    const built = buildRecurrenceMobileSteps(options);
    if (!submitText) return built;
    return built.map((step) =>
      step.id === "review" ? { ...step, submitText } : step
    );
  }, [options, submitText]);

  return (
    <div className={cn("w-full flex flex-col min-h-0 flex-1", className)}>
      <Wizard<RecurrenceFormValues>
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

export { RecurrenceDialogWizard } from "./dialog";
export * from "./steps";
export * from "./types";
