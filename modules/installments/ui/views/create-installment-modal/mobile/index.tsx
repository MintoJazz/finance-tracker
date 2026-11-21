"use client";

import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerTitle,
} from "@/components/ui/drawer";
import { InstallmentWizard } from "../../../components/installment-wizard";
import type { CreateInstallmentModalProps } from "../types";

export default function CreateInstallmentModalViewMobile({
    isOpen,
    options,
    initialData,
    onSubmit,
    onClose,
    onOpenChangeComplete,
}: CreateInstallmentModalProps) {
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
                <DrawerTitle className="sr-only">Novo Parcelamento</DrawerTitle>
                <DrawerDescription className="sr-only">
                    Cadastre uma compra parcelada para acompanhar as parcelas e o que ainda falta pagar.
                </DrawerDescription>
                <div className="flex flex-col min-h-0 flex-1 px-3.5 pt-1 pb-3">
                    <InstallmentWizard
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
