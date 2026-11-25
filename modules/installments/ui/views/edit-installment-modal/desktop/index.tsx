"use client";

import { useState } from "react";
import { InstallmentActionDialog } from "../../../components/installment-action-modal-shell";
import { InstallmentEditForm } from "../../../components/installment-edit-form";
import type { EditInstallmentModalProps } from "../types";

const FORM_ID = "edit-installment-name-form";

export default function EditInstallmentModalViewDesktop({
    isOpen,
    installment,
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: EditInstallmentModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <InstallmentActionDialog
            isOpen={isOpen}
            title="Editar nome do parcelamento"
            description="Atualize o nome exibido na listagem e, se desejar, nas parcelas existentes."
            formId={FORM_ID}
            isSubmitting={isSubmitting}
            onClose={onClose}
            onOpenChangeComplete={onOpenChangeComplete}
        >
            <InstallmentEditForm
                formId={FORM_ID}
                installment={installment}
                onSubmit={onSubmit}
                onSubmittingChange={setIsSubmitting}
            />
        </InstallmentActionDialog>
    );
}
