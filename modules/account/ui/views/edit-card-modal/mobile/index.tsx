"use client";

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
import { CardForm } from "../../../components/card-form";
import type { EditCardModalProps } from "../types";

export default function EditCardModalViewMobile({
    isOpen,
    form,
    onSubmit,
    onClose,
    onOpenChangeComplete,
    isSubmitting,
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
                <DrawerHeader>
                    <DrawerTitle>Editar Cartão</DrawerTitle>
                    <DrawerDescription>
                        Altere o nome, limite ou dias de fechamento e vencimento do seu cartão.
                    </DrawerDescription>
                </DrawerHeader>
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    <CardForm
                        form={form}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                        isSubmitting={isSubmitting}
                        submitText="Salvar alterações"
                        submitLoadingText="Salvando..."
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
}