import type { WizardStep } from "@/components/wizard";
import type { CardFormValues } from "@/modules/account/core/schemas/card.schema";
import { cardBasicsStep } from "./basics.step";
import { cardLimitStep } from "./limit.step";
import { cardCycleStep } from "./cycle.step";
import { cardReviewStep } from "./review.step";

export { cardBasicsStep } from "./basics.step";
export { cardLimitStep } from "./limit.step";
export { cardCycleStep } from "./cycle.step";
export { cardReviewStep, CardReviewContent } from "./review.step";

export const cardWizardSteps: WizardStep<CardFormValues>[] = [
  cardBasicsStep,
  cardLimitStep,
  cardCycleStep,
  cardReviewStep,
];
