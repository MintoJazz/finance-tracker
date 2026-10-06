"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { CardForm } from "../../../components/card-form";
import type { CreateCardModalProps } from "../types";

export default function CreateCardModalViewDesktop({
    isOpen,
    form,
    onSubmit,
    onClose,
    onOpenChangeComplete,
    isSubmitting,
}: CreateCardModalProps) {
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
                    <DialogTitle>Novo Cartão</DialogTitle>
                    <DialogDescription>
                        Cadastre um cartão de crédito para acompanhar limites, faturas e lançamentos.
                    </DialogDescription>
                </DialogHeader>
                <CardForm
                    form={form}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    isSubmitting={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    );
}