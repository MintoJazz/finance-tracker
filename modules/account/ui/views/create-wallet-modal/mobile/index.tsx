"use client";

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerBody,
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
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Nova Carteira</DrawerTitle>
                    <DrawerDescription>
                        Crie uma carteira para organizar e gerenciar suas movimentações financeiras.
                    </DrawerDescription>
                </DrawerHeader>
                <div className="pt-2">
                    <DrawerBody>
                        <WalletForm
                            form={form}
                            onSubmit={onSubmit}
                            onCancel={onClose}
                            isSubmitting={isSubmitting}
                        />
                    </DrawerBody>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
