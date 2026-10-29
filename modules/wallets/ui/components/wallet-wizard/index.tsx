"use client";

import * as React from "react";
import { Wizard, WizardDrawerLayout } from "@/components/wizard";
import { walletWizardSteps } from "./steps";
import type { WalletWizardProps } from "./types";
import { cn } from "@/lib/utils";
import type { CreateWalletFormValues } from "@/modules/wallets/models/wallet.schema";

export function WalletWizard({
  initialData,
  onSubmit,
  onClose,
  submitText,
  className,
}: WalletWizardProps) {
  const steps = React.useMemo(() => {
    if (!submitText) return walletWizardSteps;
    return walletWizardSteps.map((step) =>
      step.id === "review" ? { ...step, submitText } : step
    );
  }, [submitText]);

  return (
    <div className={cn("w-full flex flex-col min-h-0 flex-1", className)}>
      <Wizard<CreateWalletFormValues>
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
