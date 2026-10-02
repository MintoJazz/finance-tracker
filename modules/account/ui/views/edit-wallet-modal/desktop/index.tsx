"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { WalletForm } from "../../../components/wallet-form";
import type { EditWalletModalProps } from "../types";

export default function EditWalletModalViewDesktop({
    isOpen,
    form,
    onSubmit,
    onClose,
    isSubmitting,
}: EditWalletModalProps) {
    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Carteira</DialogTitle>
                    <DialogDescription>
                        Altere as informações da sua carteira.
                    </DialogDescription>
                </DialogHeader>
                <WalletForm
                    form={form}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    isSubmitting={isSubmitting}
                    submitText="Salvar alterações"
                    submitLoadingText="Salvando..."
                />
            </DialogContent>
        </Dialog>
    );
}
