"use client";

import * as React from "react";
import { Wizard, WizardDrawerLayout } from "@/components/wizard";
import { cn } from "@/lib/utils";
import type { CategoryFormValues } from "@/modules/categories/models/category.schema";
import { getCategoryWizardSteps } from "./steps";
import type { CategoryWizardProps } from "./types";

export function CategoryWizard({
  initialData,
  parentCategory,
  onSubmit,
  onClose,
  submitText,
  className,
}: CategoryWizardProps) {
  const steps = React.useMemo(
    () =>
      getCategoryWizardSteps({
        parentCategory,
        submitText,
      }),
    [parentCategory, submitText]
  );

  return (
    <div className={cn("w-full flex flex-col min-h-0 flex-1", className)}>
      <Wizard<CategoryFormValues>
        steps={steps}
        initialData={initialData}
        onComplete={onSubmit}
        onClose={onClose}
        pruneInactive={false}
        className="flex flex-col min-h-0 flex-1"
      >
        <WizardDrawerLayout onClose={onClose} />
      </Wizard>
    </div>
  );
}

export * from "./steps";
export * from "./types";

