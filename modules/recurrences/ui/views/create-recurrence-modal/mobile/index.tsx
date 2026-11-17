"use client";

import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerTitle,
} from "@/components/ui/drawer";
import { RecurrenceWizard } from "../../../components/recurrence-wizard";
import type { CreateRecurrenceModalProps } from "../types";

export default function CreateRecurrenceModalViewMobile({
    isOpen,
    options,
    initialData,
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: CreateRecurrenceModalProps) {
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
                <DrawerTitle className="sr-only">Nova Recorrência</DrawerTitle>
                <DrawerDescription className="sr-only">
                    Cadastre um compromisso financeiro recorrente para acompanhar pagamentos e projeções.
                </DrawerDescription>
                <div className="flex flex-col min-h-0 flex-1 px-3.5 pt-1 pb-3">
                    <RecurrenceWizard
                        options={options}
                        initialData={initialData}
                        onSubmit={onSubmit}
                        onClose={onClose}
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
}
