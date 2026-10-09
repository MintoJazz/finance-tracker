"use client";

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ArchiveRestore, Loader2 } from "lucide-react";
import type { ArchiveRestoreModalContext } from "@/hooks/use-archive-restore";

export default function RestoreContractModalViewDesktop({
    isOpen,
    itemName,
    isSubmitting,
    onConfirm,
    onClose,
    onOpenChangeComplete,
}: ArchiveRestoreModalContext) {
    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
            onOpenChangeComplete={onOpenChangeComplete}
        >
            <AlertDialogContent size="default">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-primary/10 text-primary dark:bg-primary/20">
                        <ArchiveRestore className="size-5" />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Desarquivar contrato</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza de que deseja desarquivar o contrato{" "}
                        <strong className="font-medium text-foreground">{itemName}</strong>? Ele voltará a ser
                        exibido nas listagens ativas e será considerado nas projeções (caso configurado).
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSubmitting} onClick={onClose}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isSubmitting}
                        onClick={onConfirm}
                    >
                        {isSubmitting && (
                            <Loader2 className="animate-spin" data-icon="inline-start" />
                        )}
                        {isSubmitting ? "Desarquivando..." : "Sim, desarquivar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
