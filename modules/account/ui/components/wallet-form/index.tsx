"use client";

import { DataForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { walletFormFields } from "./fields";
import type { WalletFormProps } from "./types";

export function WalletForm({
    form,
    onSubmit,
    onCancel,
    isSubmitting = false,
    submitText = "Criar carteira",
    submitLoadingText = "Criando...",
}: WalletFormProps) {
    return (
        <DataForm
            id="wallet-form"
            form={form}
            fields={walletFormFields}
            onSubmit={onSubmit}
            footer={
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        form="wallet-form"
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="animate-spin" data-icon="inline-start" />}
                        {isSubmitting ? submitLoadingText : submitText}
                    </Button>
                </div>
            }
        />
    );
}

export * from "./fields";
export * from "./types";


