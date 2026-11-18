"use client";

import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerTitle,
} from "@/components/ui/drawer";
import { RecurrenceWizard } from "../../../components/recurrence-wizard";
import type { EditRecurrenceModalProps } from "../types";

export default function EditRecurrenceModalViewMobile({
    isOpen,
    options,
    initialData,
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: EditRecurrenceModalProps) {
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
                <DrawerTitle className="sr-only">Editar Recorrência</DrawerTitle>
                <DrawerDescription className="sr-only">
                    Renomeie a recorrência ou altere a categoria padrão.
                </DrawerDescription>
                <div className="flex flex-col min-h-0 flex-1 px-3.5 pt-1 pb-3">
                    <RecurrenceWizard
                        options={options}
                        initialData={initialData}
                        onSubmit={onSubmit}
                        onClose={onClose}
                        variant="edit"
                        submitText="Salvar alterações"
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
}
