"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { InstallmentDialogWizard } from "../../../components/installment-wizard";
import type { CreateInstallmentModalProps } from "../types";

export default function CreateInstallmentModalViewDesktop({
    isOpen,
    options,
    initialData,
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: CreateInstallmentModalProps) {
    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
            onOpenChangeComplete={onOpenChangeComplete}
        >
            <DialogContent className="sm:max-w-xl max-h-[88dvh] flex flex-col overflow-hidden p-5 gap-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>Novo Parcelamento</DialogTitle>
                    <DialogDescription>
                        Cadastre uma compra parcelada para acompanhar as parcelas e o que ainda falta pagar.
                    </DialogDescription>
                </DialogHeader>
                <InstallmentDialogWizard
                    options={options}
                    initialData={initialData}
                    onSubmit={onSubmit}
                    onClose={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}
