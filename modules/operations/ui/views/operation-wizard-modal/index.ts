import type { AdaptiveConfig } from "@/types/adaptive.types"
import OperationWizardModalViewDesktop from "./desktop"
import { useOperationWizardModal } from "./hook"
import OperationWizardModalViewMobile from "./mobile"
import type {
  OperationWizardModalInput,
  OperationWizardModalProps,
} from "./types"

export const OperationWizardModalConfig: AdaptiveConfig<
  OperationWizardModalInput,
  OperationWizardModalProps
> = {
  views: {
    mobile: {
      hook: useOperationWizardModal,
      View: OperationWizardModalViewMobile,
    },
    desktop: {
      hook: useOperationWizardModal,
      View: OperationWizardModalViewDesktop,
    },
  },
}

export { useOperationWizardModal } from "./hook"
export * from "./types"

