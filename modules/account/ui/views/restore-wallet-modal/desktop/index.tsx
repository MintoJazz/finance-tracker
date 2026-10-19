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
import type { RestoreWalletModalProps } from "../types";

export default function RestoreWalletModalViewDesktop({
    isOpen,
    entityName,
    walletName,
    isSubmitting,
    onConfirm,
    onClose,
    onOpenChangeComplete,
}: RestoreWalletModalProps) {
    const name = entityName ?? walletName;
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
                    <AlertDialogTitle>Desarquivar carteira</AlertDialogTitle>
                    <AlertDialogDescription>
                        Deseja reativar a carteira{" "}
                        <strong className="font-medium text-foreground">{name}</strong>? Ela voltará a
                        aparecer nas suas listagens e resumos ativos.
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
                        {isSubmitting && <Loader2 className="animate-spin" data-icon="inline-start" />}
                        {isSubmitting ? "Desarquivando..." : "Sim, desarquivar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
