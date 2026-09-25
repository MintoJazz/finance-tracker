"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface RouteModalProps {
    title: string
    description?: string
    children: React.ReactNode
    className?: string
    onClose?: () => void
}

export function RouteModal({
    title,
    description,
    children,
    className,
    onClose,
}: RouteModalProps) {
    const router = useRouter()

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            if (onClose) {
                onClose()
            } else {
                router.back()
            }
        }
    }

    return (
        <Dialog open onOpenChange={handleOpenChange}>
            <DialogContent className={className ?? "max-h-[90vh] flex flex-col"}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <div className="flex-1 min-h-0 overflow-y-auto p-1 no-scrollbar">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    )
}
