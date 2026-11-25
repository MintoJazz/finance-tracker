"use client";

import { useState } from "react";
import { InstallmentActionDialog } from "../../../components/installment-action-modal-shell";
import { MonthlyDeadlinesForm } from "../../../components/installment-deadlines-form/monthly-fields";
import type { AdjustInstallmentDeadlinesModalProps } from "../types";

const FORM_ID = "adjust-installment-deadlines-form";

export default function AdjustInstallmentDeadlinesModalViewDesktop({
    isOpen,
    installment,
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: AdjustInstallmentDeadlinesModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <InstallmentActionDialog
            isOpen={isOpen}
            title="Ajustar dia de vencimento"
            description={`Altere o dia de vencimento das parcelas em aberto de "${installment.description}".`}
            formId={FORM_ID}
            submitText="Salvar vencimento"
            isSubmitting={isSubmitting}
            onClose={onClose}
            onOpenChangeComplete={onOpenChangeComplete}
        >
            <MonthlyDeadlinesForm
                formId={FORM_ID}
                installment={installment}
                onSubmit={onSubmit}
                onSubmittingChange={setIsSubmitting}
            />
        </InstallmentActionDialog>
    );
}
