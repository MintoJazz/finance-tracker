import type { OperationDraft } from "@/modules/operations/models/operation-input.schema"
import type { StepViews } from "@/modules/operations/ui/components/operation-wizard/types"
import { installmentsDesktopStep } from "./desktop.step"
import {
  installmentsCountMobileStep,
  installmentsIntervalMobileStep,
} from "./mobile.steps"

export const installmentsStepViews = {
  desktop: installmentsDesktopStep,
  mobile: [installmentsCountMobileStep, installmentsIntervalMobileStep],
} satisfies StepViews<OperationDraft>
