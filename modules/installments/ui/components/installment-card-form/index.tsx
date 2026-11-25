"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
    ChangeInstallmentCardSchema,
    type ChangeInstallmentCardValues,
} from "@/modules/installments/models/schemas/installment-card.schema";
import {
    getOpenInstallmentsCount,
    type InstallmentCard,
    type InstallmentListItem,
} from "@/modules/installments/models/schemas/installment-item.schema";
import { CustodyEntityPicker } from "@/modules/operations/ui/components/entity-picker";

export interface InstallmentCardFormProps {
    formId: string;
    installment: InstallmentListItem;
    cards: InstallmentCard[];
    onSubmit: (values: ChangeInstallmentCardValues) => Promise<void>;
    onSubmittingChange?: (isSubmitting: boolean) => void;
}

/** Troca de cartão — exclusivo para parcelamentos Em Fatura (`INVOICE`). */
export function InstallmentCardForm({
    formId,
    installment,
    cards,
    onSubmit,
    onSubmittingChange,
}: InstallmentCardFormProps) {
    const openCount = getOpenInstallmentsCount(installment);

    const form = useForm<ChangeInstallmentCardValues>({
        resolver: zodResolver(ChangeInstallmentCardSchema),
        defaultValues: {
            cardId: installment.card?.id ?? cards[0]?.id ?? 0,
        },
    });

    const isSubmitting = form.formState.isSubmitting;
    React.useEffect(() => {
        onSubmittingChange?.(isSubmitting);
    }, [isSubmitting, onSubmittingChange]);

    return (
        <form
            id={formId}
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
        >
            <div className="flex flex-col gap-2">
                <Label>Novo cartão de crédito</Label>
                <Controller
                    control={form.control}
                    name="cardId"
                    render={({ field }) => (
                        <CustodyEntityPicker
                            custodies={cards}
                            defaultType="CREDIT"
                            hideIcon
                            hideSubtitle
                            value={field.value || null}
                            onChange={(id) => field.onChange(id ?? 0)}
                            searchPlaceholder="Buscar cartão..."
                            emptyMessage="Nenhum cartão encontrado"
                            listClassName="max-h-[220px]"
                        />
                    )}
                />
                {form.formState.errors.cardId && (
                    <p className="text-xs text-destructive">
                        {form.formState.errors.cardId.message}
                    </p>
                )}
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
                <Info className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                    Apenas as{" "}
                    <strong className="font-medium text-foreground">
                        {openCount}{" "}
                        {openCount === 1
                            ? "parcela em fatura aberta"
                            : "parcelas em faturas abertas"}
                    </strong>{" "}
                    serão transferidas para o novo cartão.
                    {installment.consolidatedInstallments > 0 && (
                        <>
                            {" "}
                            As{" "}
                            <strong className="font-medium text-foreground">
                                {installment.consolidatedInstallments}{" "}
                                {installment.consolidatedInstallments === 1
                                    ? "parcela já fechada/paga permanece"
                                    : "parcelas já fechadas/pagas permanecem"}
                            </strong>{" "}
                            no cartão original ({installment.card?.name ?? "anterior"}).
                        </>
                    )}
                </p>
            </div>
        </form>
    );
}
