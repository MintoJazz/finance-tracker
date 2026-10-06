"use client";

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription
} from "@/components/ui/drawer";
import { WalletForm } from "../../../components/wallet-form";
import type { CreateWalletModalProps } from "../types";

export default function CreateWalletModalViewMobile({
    isOpen,
    form,
    onSubmit,
    onClose,
    isSubmitting,
}: CreateWalletModalProps) {
    return (
        <Drawer
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}

            showSwipeHandle
        >
            <DrawerContent className="data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-calc(var(--drawer-inset,0px)*2))] max-h-[calc(100dvh-calc(var(--drawer-inset,0px)*2))]">
                <DrawerHeader>
                    <DrawerTitle>Nova Carteira</DrawerTitle>
                    <DrawerDescription>
                        Crie uma carteira para organizar e gerenciar suas movimentações financeiras.
                    </DrawerDescription>
                </DrawerHeader>
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    <WalletForm
                        form={form}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
}
