"use client";

import { Form, ControlledField } from "@/components/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
        <Form
            id="wallet-form"
            form={form}
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
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="animate-spin" data-icon="inline-start" />}
                        {isSubmitting ? submitLoadingText : submitText}
                    </Button>
                </div>
            }
        >
            <ControlledField
                name="name"
                label="Nome da carteira"
                description="Ex: Carteira Principal, Dinheiro, Reserva de Emergência..."
            >
                <Input
                    placeholder="Digite o nome da carteira"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    data-1p-ignore="true"
                    data-lpignore="true"
                    autoFocus
                    disabled={isSubmitting}
                />
            </ControlledField>
        </Form>
    );
}

export * from "./types";
