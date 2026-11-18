"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { RecurrenceDialogWizard } from "../../../components/recurrence-wizard";
import type { EditRecurrenceModalProps } from "../types";

export default function EditRecurrenceModalViewDesktop({
    isOpen,
    options,
    initialData,
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: EditRecurrenceModalProps) {
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
                    <DialogTitle>Editar Recorrência</DialogTitle>
                    <DialogDescription>
                        Renomeie a recorrência ou altere a categoria padrão.
                    </DialogDescription>
                </DialogHeader>
                <RecurrenceDialogWizard
                    options={options}
                    initialData={initialData}
                    onSubmit={onSubmit}
                    onClose={onClose}
                    variant="edit"
                    submitText="Salvar alterações"
                />
            </DialogContent>
        </Dialog>
    );
}
