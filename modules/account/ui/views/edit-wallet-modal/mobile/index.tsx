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
import type { EditWalletModalProps } from "../types";

export default function EditWalletModalViewMobile({
    isOpen,
    form,
    onSubmit,
    onClose,
    isSubmitting,
}: EditWalletModalProps) {
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
                    <DrawerTitle>Editar Carteira</DrawerTitle>
                    <DrawerDescription>
                        Altere as informações da sua carteira.
                    </DrawerDescription>
                </DrawerHeader>
                <div className="pt-2">
                    <DrawerBody>
                        <WalletForm
                            form={form}
                            onSubmit={onSubmit}
                            onCancel={onClose}
                            isSubmitting={isSubmitting}
                            submitText="Salvar alterações"
                            submitLoadingText="Salvando..."
                        />
                    </DrawerBody>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
