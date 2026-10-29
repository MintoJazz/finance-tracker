"use client";

import {
    Drawer,
    DrawerContent,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
import { WalletWizard } from "../../../components/wallet-wizard";
import type { EditWalletModalProps } from "../types";

export default function EditWalletModalViewMobile({
    isOpen,
    form,
    onSubmit,
    onClose,
    onOpenChangeComplete,
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
                <DrawerTitle className="sr-only">Editar Carteira</DrawerTitle>
                <DrawerDescription className="sr-only">
                    Altere as informações da sua carteira.
                </DrawerDescription>
                <div className="flex flex-col min-h-0 flex-1 px-3.5 pt-1 pb-3">
                    <WalletWizard
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

