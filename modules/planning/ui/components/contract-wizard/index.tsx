"use client";

import * as React from "react";
import { Wizard, WizardDrawerLayout } from "@/components/wizard";
import { contractWizardSteps } from "./steps";
import type { ContractWizardProps } from "./types";
import { cn } from "@/lib/utils";
import type { ContractFormValues } from "../../../core/schemas/contract-form.schema";

export function ContractWizard({
  initialData,
  onSubmit,
  onClose,
  className,
}: ContractWizardProps) {
  return (
    <div className={cn("w-full flex flex-col min-h-0 flex-1", className)}>
      <Wizard<ContractFormValues>
        steps={contractWizardSteps}
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
