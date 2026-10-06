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
import { Archive, Loader2 } from "lucide-react";
import type { ArchiveWalletModalProps } from "../types";

export default function ArchiveWalletModalViewMobile({
    isOpen,
    walletName,
    isSubmitting,
    onConfirm,
    onClose,
    onOpenChangeComplete,
}: ArchiveWalletModalProps) {
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
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive dark:bg-destructive/20">
                        <Archive className="size-6" />
                    </div>
                    <DrawerTitle className="text-center">Arquivar carteira</DrawerTitle>
                    <DrawerDescription className="text-center">
                        Tem certeza de que deseja arquivar a carteira{" "}
                        <strong className="font-medium text-foreground">{walletName}</strong>? Suas
                        movimentações e saldo serão preservados, mas ela deixará de aparecer nas listagens ativas.
                    </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter className="pt-4">
                    <Button
                        variant="destructive"
                        disabled={isSubmitting}
                        onClick={onConfirm}
                        className="w-full"
                    >
                        {isSubmitting && <Loader2 className="animate-spin" data-icon="inline-start" />}
                        {isSubmitting ? "Arquivando..." : "Sim, arquivar"}
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
