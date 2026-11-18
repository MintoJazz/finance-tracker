export interface RestoreRecurrenceModalInput {
    id: number;
    name: string;
}

export interface RestoreRecurrenceModalProps {
    isOpen: boolean;
    entityName: string;
    isSubmitting: boolean;
    onConfirm: () => void;
    onClose: () => void;
    onOpenChangeComplete?: (open: boolean) => void;
}