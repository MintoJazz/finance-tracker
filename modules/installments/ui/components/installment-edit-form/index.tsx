"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    UpdateInstallmentNameSchema,
    type UpdateInstallmentNameInput,
    type UpdateInstallmentNameValues,
} from "@/modules/installments/models/schemas/installment-edit.schema";
import type { InstallmentListItem } from "@/modules/installments/models/schemas/installment-item.schema";
import { InstallmentAvatar } from "../installment-avatar";

export interface InstallmentEditFormProps {
    formId: string;
    installment: InstallmentListItem;
    onSubmit: (values: UpdateInstallmentNameValues) => Promise<void>;
    onSubmittingChange?: (isSubmitting: boolean) => void;
}

/**
 * Edição cadastral do parcelamento: exclusivamente Nome (+ sincronização opcional das descrições).
 * Parcelamentos não possuem `BalanceAppearance` — o avatar exibido é herdado da `CATEGORY`.
 */
export function InstallmentEditForm({
    formId,
    installment,
    onSubmit,
    onSubmittingChange,
}: InstallmentEditFormProps) {
    const form = useForm<UpdateInstallmentNameInput, unknown, UpdateInstallmentNameValues>({
        resolver: zodResolver(UpdateInstallmentNameSchema),
        defaultValues: {
            name: installment.description,
            syncEntryDescriptions: true,
        },
    });

    const isSubmitting = form.formState.isSubmitting;
    React.useEffect(() => {
        onSubmittingChange?.(isSubmitting);
    }, [isSubmitting, onSubmittingChange]);

    const currentName = form.watch("name");

    return (
        <form
            id={formId}
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
        >
            {/* Identificação visual herdada da categoria (somente leitura) */}
            <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/20 p-3">
                <InstallmentAvatar item={installment} size="md" />
                <div className="flex flex-col min-w-0">
                    <span className="truncate text-sm font-medium text-foreground">
                        {currentName?.trim() || installment.description}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                        {installment.category?.name ?? "Sem categoria"} • Aparência herdada da categoria
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="installment-name">Nome do parcelamento</Label>
                <Input
                    id="installment-name"
                    placeholder="Ex: iPhone, Geladeira, Notebook..."
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    {...form.register("name")}
                />
                {form.formState.errors.name && (
                    <p className="text-xs text-destructive">
                        {form.formState.errors.name.message}
                    </p>
                )}
            </div>

            <Controller
                control={form.control}
                name="syncEntryDescriptions"
                render={({ field }) => (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
                        <div className="flex flex-col gap-0.5">
                            <Label
                                htmlFor="sync-entry-descriptions"
                                className="text-sm font-medium cursor-pointer"
                            >
                                Atualizar descrição das parcelas
                            </Label>
                            <span className="text-xs text-muted-foreground">
                                Sincroniza o novo nome nos lançamentos existentes deste parcelamento.
                            </span>
                        </div>
                        <Switch
                            id="sync-entry-descriptions"
                            checked={Boolean(field.value)}
                            onCheckedChange={field.onChange}
                        />
                    </div>
                )}
            />
        </form>
    );
}
