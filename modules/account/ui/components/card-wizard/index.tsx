"use client";

import * as React from "react";
import { Wizard, WizardDrawerLayout } from "@/components/wizard";
import { cardWizardSteps } from "./steps";
import type { CardWizardProps } from "./types";
import { cn } from "@/lib/utils";
import type { CardFormValues } from "@/modules/account/core/schemas/card.schema";

export function CardWizard({
  initialData,
  onSubmit,
  onClose,
  submitText,
  className,
}: CardWizardProps) {
  const steps = React.useMemo(() => {
    if (!submitText) return cardWizardSteps;
    return cardWizardSteps.map((step) =>
      step.id === "review" ? { ...step, submitText } : step
    );
  }, [submitText]);

  return (
    <div className={cn("w-full flex flex-col min-h-0 flex-1", className)}>
      <Wizard<CardFormValues>
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

export * from "./steps";
export * from "./types";
