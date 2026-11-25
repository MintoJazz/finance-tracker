"use client";

import { Archive, Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ArchiveInstallmentModalProps } from "../types";

export default function ArchiveInstallmentModalViewDesktop({
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
                    <AlertDialogTitle>Arquivar parcelamento</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza de que deseja arquivar{" "}
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
                        . Esta ação é irreversível e o parcelamento não poderá ser restaurado.
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
                        {isSubmitting && (
                            <Loader2 className="animate-spin" data-icon="inline-start" />
                        )}
                        {isSubmitting ? "Arquivando..." : "Sim, arquivar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
