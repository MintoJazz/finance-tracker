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
import type { RestoreCardModalProps } from "../types";

export default function RestoreCardModalViewDesktop({
    isOpen,
    walletName,
    isSubmitting,
    onConfirm,
    onClose,
    onOpenChangeComplete,
}: RestoreCardModalProps) {
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
                    <AlertDialogTitle>Desarquivar cartão</AlertDialogTitle>
                    <AlertDialogDescription>
                        Deseja reativar o cartão{" "}
                        <strong className="font-medium text-foreground">{walletName}</strong>? Ele
                        voltará a aparecer nas suas listagens e resumos ativos.
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