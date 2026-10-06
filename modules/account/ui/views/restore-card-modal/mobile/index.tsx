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
import type { RestoreCardModalProps } from "../types";

export default function RestoreCardModalViewMobile({
    isOpen,
    walletName,
    isSubmitting,
    onConfirm,
    onClose,
    onOpenChangeComplete,
}: RestoreCardModalProps) {
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
                    <DrawerTitle className="text-center">Desarquivar cartão</DrawerTitle>
                    <DrawerDescription className="text-center">
                        Deseja reativar o cartão{" "}
                        <strong className="font-medium text-foreground">{walletName}</strong>? Ele
                        voltará a aparecer nas suas listagens e resumos ativos.
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