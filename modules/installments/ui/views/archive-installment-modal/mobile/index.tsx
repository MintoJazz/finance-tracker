"use client";

import { Archive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import type { ArchiveInstallmentModalProps } from "../types";

export default function ArchiveInstallmentModalViewMobile({
    isOpen,
    entityName,
    keptCount,
    cancelledCount,
    isSubmitting,
    onConfirm,
    onClose,
    onOpenChangeComplete,
}: ArchiveInstallmentModalProps) {
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
                    <DrawerTitle className="text-center">Arquivar parcelamento</DrawerTitle>
                    <DrawerDescription className="text-center">
                        Deseja arquivar{" "}
                        <strong className="font-medium text-foreground">
                            {entityName}
                        </strong>
                        ?{" "}
                        <strong className="font-medium text-foreground">
                            {keptCount}{" "}
                            {keptCount === 1
                                ? "parcela consolidada será mantida"
                                : "parcelas consolidadas serão mantidas"}
                        </strong>{" "}
                        no histórico e{" "}
                        <strong className="font-medium text-foreground">
                            {cancelledCount}{" "}
                            {cancelledCount === 1
                                ? "parcela em aberto será cancelada"
                                : "parcelas em aberto serão canceladas"}
                        </strong>
                        . Esta ação é irreversível e não pode ser desfeita.
                    </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter className="pt-4">
                    <Button
                        variant="destructive"
                        disabled={isSubmitting}
                        onClick={onConfirm}
                        className="w-full"
                    >
                        {isSubmitting && (
                            <Loader2 className="animate-spin" data-icon="inline-start" />
                        )}
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
