"use client";

import {
    Drawer,
    DrawerContent,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
import { WalletWizard } from "../../../components/wallet-wizard";
import type { CreateWalletModalProps } from "../types";

export default function CreateWalletModalViewMobile({
    isOpen,
    form,
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: CreateWalletModalProps) {
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
                <DrawerTitle className="sr-only">Nova Carteira</DrawerTitle>
                <DrawerDescription className="sr-only">
                    Crie uma carteira para organizar e gerenciar suas movimentações financeiras.
                </DrawerDescription>
                <div className="flex flex-col min-h-0 flex-1 px-3.5 pt-1 pb-3">
                    <WalletWizard
                        initialData={form.getValues()}
                        onSubmit={onSubmit}
                        onClose={onClose}
                        submitText="Criar carteira"
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
}
