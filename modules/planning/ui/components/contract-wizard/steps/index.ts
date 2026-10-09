import type { WizardStep } from "@/components/wizard";
import type { ContractFormValues } from "../../../../core/schemas/contract-form.schema";
import { basicsStep } from "./basics.step";
import { valuesStep } from "./values.step";
import { scheduleStep } from "./schedule.step";
import { reviewStep } from "./review.step";

export { basicsStep } from "./basics.step";
export { valuesStep } from "./values.step";
export { scheduleStep } from "./schedule.step";
export { reviewStep, ContractReviewContent } from "./review.step";

export const contractWizardSteps: WizardStep<ContractFormValues>[] = [
  basicsStep,
  valuesStep,
  scheduleStep,
  reviewStep,
];
