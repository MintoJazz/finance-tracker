"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface RouteAlertDialogProps {
    title: string
    description?: string
    cancelLabel?: string
    confirmLabel?: string
    confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    onConfirm: () => Promise<void> | void
    onClose?: () => void
}

export function RouteAlertDialog({
    title,
    description,
    cancelLabel = "Cancelar",
    confirmLabel = "Confirmar",
    confirmVariant = "destructive",
    onConfirm,
    onClose,
}: RouteAlertDialogProps) {
    const router = useRouter()
    const [isPending, setIsPending] = React.useState(false)

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            if (onClose) {
                onClose()
            } else {
                router.back()
            }
        }
    }

    const handleConfirm = async (e: React.MouseEvent) => {
        e.preventDefault()
        try {
            setIsPending(true)
            await onConfirm()
        } finally {
            setIsPending(false)
        }
    }

    return (
        <AlertDialog open onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description && (
                        <AlertDialogDescription>{description}</AlertDialogDescription>
                    )}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending} onClick={() => handleOpenChange(false)}>
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant={confirmVariant}
                        disabled={isPending}
                        onClick={handleConfirm}
                    >
                        {isPending ? "Processando..." : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
