"use client";

import * as React from "react";
import type { FieldValues } from "react-hook-form";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    Wizard,
    WizardDrawerLayout,
    type WizardStep,
} from "@/components/wizard";
import { EffectiveFromSchema } from "@/modules/agreements/models/effective-from.schema";
import { effectiveFromFields } from "../effective-from-field";
import type { AdjustFormProps } from "./types";

export function AdjustFormDrawer<TForm extends FieldValues>({
    isOpen,
    title,
    description,
    stepTitle,
    detailsSchema,
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
                    id: "details",
                    title: stepTitle,
                    schema: detailsSchema,
                    fields,
                },
                {
                    id: "effective",
                    title: "Quando aplicar",
                    schema: EffectiveFromSchema,
                    fields: effectiveFromFields,
                    submitText,
                },
            ] as unknown as WizardStep<TForm>[],
        [stepTitle, detailsSchema, fields, submitText]
    );

    return (
        <Drawer
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
            onOpenChangeComplete={onOpenChangeComplete}
            showSwipeHandle
        >
            <DrawerContent className="data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-calc(var(--drawer-inset,0px)*2))] max-h-[calc(100dvh-calc(var(--drawer-inset,0px)*2))]">
                <DrawerTitle className="sr-only">{title}</DrawerTitle>
                <DrawerDescription className="sr-only">
                    {description}
                </DrawerDescription>
                <div className="flex flex-col min-h-0 flex-1 px-3.5 pt-1 pb-3">
                    <Wizard<TForm>
                        steps={steps}
                        initialData={initialData}
                        onComplete={onSubmit}
                        onClose={onClose}
                        pruneInactive={false}
                        className="flex flex-col min-h-0 flex-1"
                    >
                        <WizardDrawerLayout onClose={onClose} />
                    </Wizard>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
