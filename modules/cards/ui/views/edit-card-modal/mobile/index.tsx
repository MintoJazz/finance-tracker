"use client";

import {
    Drawer,
    DrawerContent,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
import { CardWizard } from "../../../components/card-wizard";
import type { EditCardModalProps } from "../types";

export default function EditCardModalViewMobile({
    isOpen,
    form,
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: EditCardModalProps) {
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
                <DrawerTitle className="sr-only">Editar Cartão</DrawerTitle>
                <DrawerDescription className="sr-only">
                    Altere o nome, limite ou dias de fechamento e vencimento do seu cartão.
                </DrawerDescription>
                <div className="flex flex-col min-h-0 flex-1 px-3.5 pt-1 pb-3">
                    <CardWizard
                        initialData={form.getValues()}
                        onSubmit={onSubmit}
                        onClose={onClose}
                        submitText="Salvar alterações"
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
}