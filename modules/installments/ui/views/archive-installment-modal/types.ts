export interface ArchiveInstallmentModalProps {
    isOpen: boolean;
    entityName: string;
    /** Parcelas consolidadas que serão preservadas no histórico. */
    keptCount: number;
    /** Parcelas em aberto que serão canceladas/neutralizadas. */
    cancelledCount: number;
    isSubmitting: boolean;
    onConfirm: () => Promise<void>;
    onClose: () => void;
    onOpenChangeComplete?: (open: boolean) => void;
}
