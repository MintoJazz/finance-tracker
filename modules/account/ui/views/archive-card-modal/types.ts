export interface ArchiveCardModalInput {
    id: number;
    name: string;
}

export interface ArchiveCardModalProps {
    isOpen: boolean;
    walletName: string;
    isSubmitting: boolean;
    onConfirm: () => void;
    onClose: () => void;
    onOpenChangeComplete?: (open: boolean) => void;
}