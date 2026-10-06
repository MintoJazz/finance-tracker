"use client";

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
import { WalletForm } from "../../../components/wallet-form";
import type { EditWalletModalProps } from "../types";

export default function EditWalletModalViewMobile({
    isOpen,
    form,
    onSubmit,
    onClose,
    onOpenChangeComplete,
    isSubmitting,
}: EditWalletModalProps) {
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
                    <DrawerTitle>Editar Carteira</DrawerTitle>
                    <DrawerDescription>
                        Altere as informações da sua carteira.
                    </DrawerDescription>
                </DrawerHeader>
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    <WalletForm
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
