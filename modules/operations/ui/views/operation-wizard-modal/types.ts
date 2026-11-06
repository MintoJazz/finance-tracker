import type { OperationDraft } from "../../../models/operation-input.schema"

export interface OperationWizardModalInput {
  isOpen?: boolean
  onClose?: () => void
  onComplete?: (payload: Partial<OperationDraft>) => void | Promise<void>
}

export interface OperationWizardModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenChangeComplete: (open: boolean) => void
  onComplete: (payload: Partial<OperationDraft>) => void | Promise<void>
}

