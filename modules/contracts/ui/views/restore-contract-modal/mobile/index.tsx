"use client";

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ArchiveRestore, Loader2 } from "lucide-react";
import type { ArchiveRestoreModalContext } from "@/hooks/use-archive-restore";

export default function RestoreContractModalViewMobile({
    isOpen,
    itemName,
    isSubmitting,
    onConfirm,
    onClose,
    onOpenChangeComplete,
}: ArchiveRestoreModalContext) {
    return (
        <Drawer
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
            onOpenChangeComplete={onOpenChangeComplete}
            showSwipeHandle
        >
            <DrawerContent>
                <DrawerHeader>
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                        <ArchiveRestore className="size-6" />
                    </div>
                    <DrawerTitle className="text-center">Desarquivar contrato</DrawerTitle>
                    <DrawerDescription className="text-center">
                        Tem certeza de que deseja desarquivar o contrato{" "}
                        <strong className="font-medium text-foreground">{itemName}</strong>? Ele voltará a ser
                        exibido nas listagens ativas e será considerado nas projeções (caso configurado).
                    </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter className="pt-4">
                    <Button
                        disabled={isSubmitting}
                        onClick={onConfirm}
                        className="w-full"
                    >
                        {isSubmitting && (
                            <Loader2 className="animate-spin" data-icon="inline-start" />
                        )}
                        {isSubmitting ? "Desarquivando..." : "Sim, desarquivar"}
                    </Button>
                    <Button
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={onClose}
                        className="w-full"
                    >
                        Cancelar
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
