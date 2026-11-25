"use client";

import * as React from "react";
import { ArrowRight, CreditCard, ShieldCheck } from "lucide-react";
import {
    WizardReviewCard,
    WizardReviewHint,
    WizardReviewRow,
    type CustomStepProps,
    type WizardStep,
} from "@/components/wizard";
import {
    ChangeInstallmentCardSchema,
    type ChangeInstallmentCardValues,
} from "@/modules/installments/models/schemas/installment-card.schema";
import { getOpenInstallmentsCount } from "@/modules/installments/models/schemas/installment-item.schema";
import { CustodyEntityPicker } from "@/modules/operations/ui/components/entity-picker";
import { InstallmentWizardDrawer } from "../../../components/installment-action-modal-shell";
import type { ChangeInstallmentCardModalProps } from "../types";

export default function ChangeInstallmentCardModalViewMobile({
    isOpen,
    installment,
    cards,
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: ChangeInstallmentCardModalProps) {
    const openCount = getOpenInstallmentsCount(installment);

    const initialData = React.useMemo<ChangeInstallmentCardValues>(
        () => ({
            cardId: installment.card?.id ?? cards[0]?.id ?? 0,
        }),
        [installment.card?.id, cards]
    );

    const steps = React.useMemo<WizardStep<ChangeInstallmentCardValues>[]>(() => {
        const ScopeContent = () => (
            <div className="flex flex-col gap-3 py-1">
                <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3.5">
                    <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1 text-xs leading-relaxed">
                        <span className="text-sm font-medium text-foreground">
                            Apenas parcelas em faturas abertas
                        </span>
                        <p className="text-muted-foreground">
                            <strong className="font-medium text-foreground">
                                {openCount}{" "}
                                {openCount === 1
                                    ? "parcela em fatura aberta será transferida"
                                    : "parcelas em faturas abertas serão transferidas"}
                            </strong>{" "}
                            para o novo cartão.
                        </p>
                        {installment.consolidatedInstallments > 0 && (
                            <p className="text-muted-foreground">
                                As{" "}
                                <strong className="font-medium text-foreground">
                                    {installment.consolidatedInstallments}{" "}
                                    {installment.consolidatedInstallments === 1
                                        ? "parcela já fechada/paga permanece"
                                        : "parcelas já fechadas/pagas permanecem"}
                                </strong>{" "}
                                vinculadas ao cartão original (
                                {installment.card?.name ?? "anterior"}).
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );

        const ReviewContent = ({
            data,
        }: CustomStepProps<ChangeInstallmentCardValues>) => {
            const nextCard = cards.find((c) => c.id === data.cardId);

            return (
                <div className="space-y-2.5 py-0.5">
                    <WizardReviewCard>
                        <WizardReviewRow
                            icon={<CreditCard className="size-4" />}
                            label="Cartão"
                            value={
                                <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                                    <span className="text-muted-foreground font-normal">
                                        {installment.card?.name ?? "—"}
                                    </span>
                                    <ArrowRight className="size-3.5 text-muted-foreground" />
                                    <span>{nextCard?.name ?? "—"}</span>
                                </span>
                            }
                            stepId="card"
                        />

                        <WizardReviewRow
                            icon={<ShieldCheck className="size-4" />}
                            label="Vigência do ajuste"
                            value={`${openCount} ${
                                openCount === 1
                                    ? "parcela em fatura aberta"
                                    : "parcelas em faturas abertas"
                            }`}
                            stepId="scope"
                        />
                    </WizardReviewCard>

                    <WizardReviewHint>
                        Faturas já fechadas ou pagas não sofrem alteração.
                    </WizardReviewHint>
                </div>
            );
        };

        return [
            {
                id: "card",
                title: "Cartão",
                schema: ChangeInstallmentCardSchema,
                fields: [
                    {
                        name: "cardId",
                        children: (_ctx, field) => (
                            <CustodyEntityPicker
                                custodies={cards}
                                defaultType="CREDIT"
                                hideIcon
                                hideSubtitle
                                value={(field.value as number) || null}
                                onChange={(id) => field.onChange(id ?? 0)}
                                searchPlaceholder="Buscar cartão..."
                                emptyMessage="Nenhum cartão encontrado"
                                listClassName="max-h-[240px]"
                            />
                        ),
                    },
                ],
            },
            {
                id: "scope",
                title: "Vigência do ajuste",
                component: ScopeContent,
            },
            {
                id: "review",
                title: "Resumo",
                submitText: "Confirmar troca",
                component: ReviewContent,
            },
        ];
    }, [cards, installment.card?.name, installment.consolidatedInstallments, openCount]);

    return (
        <InstallmentWizardDrawer<ChangeInstallmentCardValues>
            isOpen={isOpen}
            title="Trocar cartão"
            description={`Transfira as parcelas em faturas abertas de "${installment.description}" para outro cartão.`}
            steps={steps}
            initialData={initialData}
            onComplete={onSubmit}
            onClose={onClose}
            onOpenChangeComplete={onOpenChangeComplete}
        />
    );
}
