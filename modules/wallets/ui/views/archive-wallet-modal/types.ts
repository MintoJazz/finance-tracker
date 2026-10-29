export interface ArchiveWalletModalInput {
    id: number;
    name: string;
}

export interface ArchiveWalletModalProps {
    isOpen: boolean;
    entityName: string;
    walletName?: string;
    isSubmitting: boolean;
    onConfirm: () => void;
    onClose: () => void;
    onOpenChangeComplete?: (open: boolean) => void;
}
