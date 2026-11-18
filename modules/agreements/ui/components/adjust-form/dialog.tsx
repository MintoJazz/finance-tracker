"use client";

import * as React from "react";
import type { FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Wizard,
    WizardDialogLayout,
    WizardNext,
    useWizard,
    type WizardStep,
} from "@/components/wizard";
import { effectiveFromFields } from "../effective-from-field";
import type { AdjustFormProps } from "./types";

function AdjustDialogFooter({
    onClose,
    submitText,
}: {
    onClose: () => void;
    submitText: string;
}) {
    const { isSubmitting } = useWizard();

    return (
        <DialogFooter className="-mx-5 -mb-5 mt-auto flex-row justify-end gap-2 border-t border-border/60 bg-muted/30 px-5 py-3 rounded-b-xl">
            <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
            >
                Cancelar
            </Button>
            <WizardNext>{submitText}</WizardNext>
        </DialogFooter>
    );
}

export function AdjustFormDialog<TForm extends FieldValues>({
    isOpen,
    title,
    description,
    schema,
    fields,
    initialData,
    submitText = "Salvar",
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: AdjustFormProps<TForm>) {
    const steps = React.useMemo(
        () =>
            [
                {
                    id: "adjust",
                    title,
                    schema,
                    fields: [...fields, ...effectiveFromFields],
                },
            ] as unknown as WizardStep<TForm>[],
        [title, schema, fields]
    );

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
            onOpenChangeComplete={onOpenChangeComplete}
        >
            <DialogContent className="sm:max-w-md max-h-[88dvh] flex flex-col overflow-hidden p-5 gap-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <Wizard<TForm>
                    steps={steps}
                    initialData={initialData}
                    onComplete={onSubmit}
                    onClose={onClose}
                    pruneInactive={false}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <WizardDialogLayout
                        title={title}
                        description={description}
                        hideProgressWhenSingle
                        footer={
                            <AdjustDialogFooter
                                onClose={onClose}
                                submitText={submitText}
                            />
                        }
                    />
                </Wizard>
            </DialogContent>
        </Dialog>
    );
}
