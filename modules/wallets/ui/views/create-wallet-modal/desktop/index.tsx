"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { WalletForm } from "../../../components/wallet-form";
import type { CreateWalletModalProps } from "../types";

export default function CreateWalletModalViewDesktop({
    isOpen,
    form,
    onSubmit,
    onClose,
    onOpenChangeComplete,
    isSubmitting,
}: CreateWalletModalProps) {
    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
            onOpenChangeComplete={onOpenChangeComplete}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Nova Carteira</DialogTitle>
                    <DialogDescription>
                        Crie uma carteira para organizar e gerenciar suas movimentações financeiras.
                    </DialogDescription>
                </DialogHeader>
                <WalletForm
                    form={form}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    isSubmitting={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    );
}
