"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { RecurrenceDialogWizard } from "../../../components/recurrence-wizard";
import type { CreateRecurrenceModalProps } from "../types";

export default function CreateRecurrenceModalViewDesktop({
    isOpen,
    options,
    initialData,
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: CreateRecurrenceModalProps) {
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
                    <DialogTitle>Nova Recorrência</DialogTitle>
                    <DialogDescription>
                        Cadastre um compromisso financeiro recorrente para acompanhar pagamentos e projeções.
                    </DialogDescription>
                </DialogHeader>
                <RecurrenceDialogWizard
                    options={options}
                    initialData={initialData}
                    onSubmit={onSubmit}
                    onClose={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}
