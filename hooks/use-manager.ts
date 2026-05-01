'use client'

import { useState, useCallback } from "react";

export function useManager<T>() {
    const [target, setTarget] = useState<T | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isUpdateOpen, setIsUpdateOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const onEdit = useCallback((target: T) => {
        setTarget(target)
        setIsUpdateOpen(true)
    }, [])

    const onDelete = useCallback((target: T) => {
        setTarget(target)
        setIsDeleteOpen(true)
    }, [])

    const onCloseUpdate = useCallback((open: boolean) => {
        setIsUpdateOpen(open)
        if (!open) setTimeout(() => setTarget(null), 300)
    }, [])

    const onCloseDelete = useCallback((open: boolean) => {
        setIsDeleteOpen(open)
        if (!open) setTimeout(() => setTarget(null), 300)
    }, [])

    return {
        target,
        setTarget,
        isCreateOpen,
        setIsCreateOpen,
        isUpdateOpen,
        setIsUpdateOpen,
        isDeleteOpen,
        setIsDeleteOpen,
        onEdit,
        onDelete,
        onCloseUpdate,
        onCloseDelete,
    }
}