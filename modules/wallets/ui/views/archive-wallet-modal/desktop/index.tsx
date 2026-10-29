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
import { Archive, Loader2 } from "lucide-react";
import type { ArchiveWalletModalProps } from "../types";

export default function ArchiveWalletModalViewDesktop({
    isOpen,
    entityName,
    walletName,
    isSubmitting,
    onConfirm,
    onClose,
    onOpenChangeComplete,
}: ArchiveWalletModalProps) {
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
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
                        <Archive className="size-5" />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Arquivar carteira</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza de que deseja arquivar a carteira{" "}
                        <strong className="font-medium text-foreground">{name}</strong>? Suas
                        movimentações e saldo serão preservados, mas ela deixará de aparecer nas listagens ativas.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSubmitting} onClick={onClose}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={isSubmitting}
                        onClick={onConfirm}
                    >
                        {isSubmitting && <Loader2 className="animate-spin" data-icon="inline-start" />}
                        {isSubmitting ? "Arquivando..." : "Sim, arquivar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
