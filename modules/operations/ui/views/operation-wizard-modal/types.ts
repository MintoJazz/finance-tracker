import type { OperationDraft } from "../../../models/operation-input.schema"
import type { OperationOptions } from "../../../models/operation-options.schema"
import type { OperationSeed } from "../../../models/operation-seed.schema"

export interface OperationWizardModalInput {
  isOpen?: boolean
  seed?: OperationSeed
  options?: OperationOptions
  onClose?: () => void
  onComplete?: (payload: Partial<OperationDraft>) => void | Promise<void>
}

export interface OperationWizardModalProps {
  isOpen: boolean
  seed?: OperationSeed
  options?: OperationOptions
  onClose: () => void
  onOpenChangeComplete: (open: boolean) => void
  onComplete: (payload: Partial<OperationDraft>) => void | Promise<void>
}
