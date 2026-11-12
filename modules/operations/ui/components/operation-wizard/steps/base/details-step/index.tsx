import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { StepViews } from "@/modules/operations/ui/components/operation-wizard/types"
import { detailsDesktopStep } from "./desktop.step"
import {
  detailsDatesMobileStep,
  detailsDescriptionMobileStep,
} from "./mobile.steps"

export const detailsStepViews = {
  desktop: detailsDesktopStep,
  mobile: [
    detailsDescriptionMobileStep,
    detailsDatesMobileStep,
  ],
} satisfies StepViews<OperationDraft>
