export interface RestoreCardModalInput {
    id: number;
    name: string;
}

export interface RestoreCardModalProps {
    isOpen: boolean;
    walletName: string;
    isSubmitting: boolean;
    onConfirm: () => void;
    onClose: () => void;
    onOpenChangeComplete?: (open: boolean) => void;
}