"use client";

import { useState } from "react";
import { InstallmentActionDialog } from "../../../components/installment-action-modal-shell";
import { InstallmentValuesForm } from "../../../components/installment-values-form";
import type { AdjustInstallmentValuesModalProps } from "../types";

const FORM_ID = "adjust-installment-values-form";

export default function AdjustInstallmentValuesModalViewDesktop({
    isOpen,
    installment,
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: AdjustInstallmentValuesModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValid, setIsValid] = useState(true);

    return (
        <InstallmentActionDialog
            isOpen={isOpen}
            title="Ajustar valores e parcelas"
            description={`Reestruture a quantidade e o valor das parcelas em aberto de "${installment.description}".`}
            formId={FORM_ID}
            submitText="Confirmar ajuste"
            isSubmitting={isSubmitting}
            submitDisabled={!isValid}
            onClose={onClose}
            onOpenChangeComplete={onOpenChangeComplete}
            className="sm:max-w-2xl"
        >
            <InstallmentValuesForm
                formId={FORM_ID}
                installment={installment}
                onSubmit={onSubmit}
                onSubmittingChange={setIsSubmitting}
                onValidityChange={setIsValid}
            />
        </InstallmentActionDialog>
    );
}
