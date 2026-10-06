export interface RestoreWalletModalInput {
    id: number;
    name: string;
}

export interface RestoreWalletModalProps {
    isOpen: boolean;
    walletName: string;
    isSubmitting: boolean;
    onConfirm: () => void;
    onClose: () => void;
    onOpenChangeComplete?: (open: boolean) => void;
}
