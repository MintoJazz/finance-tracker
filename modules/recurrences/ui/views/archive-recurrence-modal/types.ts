export interface ArchiveRecurrenceModalInput {
    id: number;
    name: string;
}

export interface ArchiveRecurrenceModalProps {
    isOpen: boolean;
    entityName: string;
    isSubmitting: boolean;
    onConfirm: () => void;
    onClose: () => void;
    onOpenChangeComplete?: (open: boolean) => void;
}