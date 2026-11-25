"use client";

import { useState } from "react";
import { InstallmentActionDialog } from "../../../components/installment-action-modal-shell";
import { InstallmentCardForm } from "../../../components/installment-card-form";
import type { ChangeInstallmentCardModalProps } from "../types";

const FORM_ID = "change-installment-card-form";

export default function ChangeInstallmentCardModalViewDesktop({
    isOpen,
    installment,
    cards,
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: ChangeInstallmentCardModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <InstallmentActionDialog
            isOpen={isOpen}
            title="Trocar cartão"
            description={`Transfira as parcelas em faturas abertas de "${installment.description}" para outro cartão.`}
            formId={FORM_ID}
            submitText="Trocar cartão"
            isSubmitting={isSubmitting}
            onClose={onClose}
            onOpenChangeComplete={onOpenChangeComplete}
        >
            <InstallmentCardForm
                formId={FORM_ID}
                installment={installment}
                cards={cards}
                onSubmit={onSubmit}
                onSubmittingChange={setIsSubmitting}
            />
        </InstallmentActionDialog>
    );
}
