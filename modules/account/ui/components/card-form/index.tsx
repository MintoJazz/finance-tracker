"use client";

import { DataForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { CardFormProps } from "./types";
import { cardFormFields } from "./fields";

export function CardForm({
    form,
    onSubmit,
    onCancel,
    isSubmitting = false,
    submitText = "Criar cartão",
    submitLoadingText = "Criando...",
}: CardFormProps) {
    return (
        <DataForm
            id="card-form"
            form={form}
            fields={cardFormFields}
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
                        form="card-form"
                        disabled={isSubmitting}
                    >
                        {isSubmitting && (
                            <Loader2 className="animate-spin" data-icon="inline-start" />
                        )}
                        {isSubmitting ? submitLoadingText : submitText}
                    </Button>
                </div>
            }
        />
    );
}

export * from "./fields";
export * from "./types";