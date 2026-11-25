"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { InstallmentCategoryForm } from "../../../components/installment-category-form";
import type { ChangeInstallmentCategoryModalProps } from "../types";

export default function ChangeInstallmentCategoryModalViewDesktop({
    isOpen,
    installment,
    options,
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: ChangeInstallmentCategoryModalProps) {
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
                    <DialogTitle>Trocar categoria</DialogTitle>
                    <DialogDescription>
                        Escolha a nova categoria para &quot;{installment.description}&quot; e defina o escopo.
                    </DialogDescription>
                </DialogHeader>
                <InstallmentCategoryForm
                    installment={installment}
                    options={options}
                    onSubmit={onSubmit}
                    onClose={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}
