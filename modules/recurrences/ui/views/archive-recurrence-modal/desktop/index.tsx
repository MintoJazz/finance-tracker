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
import type { ArchiveRecurrenceModalProps } from "../types";

export default function ArchiveRecurrenceModalViewDesktop({
    isOpen,
    entityName,
    isSubmitting,
    onConfirm,
    onClose,
    onOpenChangeComplete,
}: ArchiveRecurrenceModalProps) {
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
                    <AlertDialogTitle>Arquivar recorrência</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza de que deseja arquivar a recorrência{" "}
                        <strong className="font-medium text-foreground">{entityName}</strong>? O
                        histórico de ciclos e lançamentos será preservado, mas ela deixará de aparecer nas listagens ativas.
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