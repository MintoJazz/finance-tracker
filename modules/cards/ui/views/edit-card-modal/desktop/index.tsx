"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { CardForm } from "../../../components/card-form";
import type { EditCardModalProps } from "../types";

export default function EditCardModalViewDesktop({
    isOpen,
    form,
    onSubmit,
    onClose,
    onOpenChangeComplete,
    isSubmitting,
}: EditCardModalProps) {
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
                    <DialogTitle>Editar Cartão</DialogTitle>
                    <DialogDescription>
                        Altere o nome, limite ou dias de fechamento e vencimento do seu cartão.
                    </DialogDescription>
                </DialogHeader>
                <CardForm
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