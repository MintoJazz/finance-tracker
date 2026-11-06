import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { StepViews } from "@/modules/operations/ui/components/operation-wizard/types"
import { reimbursementDesktopStep } from "./desktop.step"
import {
  reimbursementAmountMobileStep,
  reimbursementTargetsMobileStep,
} from "./mobile.steps"

export const reimbursementStepViews = {
  desktop: reimbursementDesktopStep,
  mobile: [reimbursementTargetsMobileStep, reimbursementAmountMobileStep],
} satisfies StepViews<OperationDraft>
