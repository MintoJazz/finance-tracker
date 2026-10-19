"use client";

import { useState, useCallback, useMemo } from "react";
import { useQueryParams } from "./use-query-params";
import { toast } from "@/components/ui/toast";

export type ArchiveRestoreFindFn<T> = (item: T) => T | undefined;

export interface UseArchiveRestoreOptions<T> {
    find: ArchiveRestoreFindFn<T>;
    entityName?: string;
    onArchiveConfirm?: (item: T) => Promise<void> | void;
    onRestoreConfirm?: (item: T) => Promise<void> | void;
}

export interface ArchiveRestoreModalContext {
    isOpen: boolean;
    walletName: string;
    entityName: string;
    itemName: string;
    isSubmitting: boolean;
    onConfirm: () => Promise<void>;
    onClose: () => void;
    onOpenChangeComplete?: (open: boolean) => void;
}

export function useArchiveRestore<T extends { id: number; name?: string }>(
    optionsOrFind: ArchiveRestoreFindFn<T> | UseArchiveRestoreOptions<T>
) {
    const { getParam, setParam } = useQueryParams();

    const options = useMemo(() => {
        if (typeof optionsOrFind === "function") {
            return { find: optionsOrFind };
        }
        return optionsOrFind;
    }, [optionsOrFind]);

    const { find, entityName = "Carteira", onArchiveConfirm, onRestoreConfirm } = options;

    const findItem = useCallback(
        (target: { id: number } | T | number): T | undefined => {
            if (!target) return undefined;
            if (typeof target === "number") {
                return find({ id: target } as unknown as T);
            }
            return find(target as T);
        },
        [find]
    );

    const archiveParam = getParam("archive");
    const restoreParam = getParam("restore");

    const [isSubmittingArchive, setIsSubmittingArchive] = useState(false);
    const [isSubmittingRestore, setIsSubmittingRestore] = useState(false);

    const onArchive = useCallback(
        (item: T) => {
            setParam("archive", String(item.id));
        },
        [setParam]
    );

    const onRestore = useCallback(
        (item: T) => {
            setParam("restore", String(item.id));
        },
        [setParam]
    );

    const closeArchive = useCallback(() => {
        setParam("archive", null);
    }, [setParam]);

    const closeRestore = useCallback(() => {
        setParam("restore", null);
    }, [setParam]);

    const archiveTarget = useMemo(() => {
        if (!archiveParam) return null;
        const id = Number(archiveParam);
        if (Number.isNaN(id) || id <= 0) return null;
        return findItem({ id }) ?? null;
    }, [archiveParam, findItem]);

    const restoreTarget = useMemo(() => {
        if (!restoreParam) return null;
        const id = Number(restoreParam);
        if (Number.isNaN(id) || id <= 0) return null;
        return findItem({ id }) ?? null;
    }, [restoreParam, findItem]);

    const confirmArchive = useCallback(async () => {
        if (!archiveTarget) return;
        setIsSubmittingArchive(true);
        try {
            if (onArchiveConfirm) {
                await onArchiveConfirm(archiveTarget);
            } else {
                await new Promise((resolve) => setTimeout(resolve, 600));
            }
            toast.add({
                type: "success",
                title: `${entityName} arquivada`,
                description: `A ${entityName.toLowerCase()} "${archiveTarget.name ?? ""}" foi arquivada com sucesso.`,
            });
            closeArchive();
        } catch (error) {
            console.error("[useArchiveRestore] Erro ao arquivar:", error);
            toast.add({
                type: "error",
                title: "Erro ao arquivar",
                description:
                    error instanceof Error && error.message
                        ? error.message
                        : `Não foi possível arquivar a ${entityName.toLowerCase()}. Tente novamente.`,
                priority: "high",
            });
        } finally {
            setIsSubmittingArchive(false);
        }
    }, [archiveTarget, onArchiveConfirm, entityName, closeArchive]);

    const confirmRestore = useCallback(async () => {
        if (!restoreTarget) return;
        setIsSubmittingRestore(true);
        try {
            if (onRestoreConfirm) {
                await onRestoreConfirm(restoreTarget);
            } else {
                await new Promise((resolve) => setTimeout(resolve, 600));
            }
            toast.add({
                type: "success",
                title: `${entityName} desarquivada`,
                description: `A ${entityName.toLowerCase()} "${restoreTarget.name ?? ""}" foi desarquivada com sucesso.`,
            });
            closeRestore();
        } catch (error) {
            console.error("[useArchiveRestore] Erro ao desarquivar:", error);
            toast.add({
                type: "error",
                title: "Erro ao desarquivar",
                description:
                    error instanceof Error && error.message
                        ? error.message
                        : `Não foi possível desarquivar a ${entityName.toLowerCase()}. Tente novamente.`,
                priority: "high",
            });
        } finally {
            setIsSubmittingRestore(false);
        }
    }, [restoreTarget, onRestoreConfirm, entityName, closeRestore]);

    const archiveContext: ArchiveRestoreModalContext = useMemo(
        () => ({
            isOpen: Boolean(archiveParam && archiveTarget),
            walletName: archiveTarget?.name ?? "",
            entityName: archiveTarget?.name ?? "",
            itemName: archiveTarget?.name ?? "",
            isSubmitting: isSubmittingArchive,
            onConfirm: confirmArchive,
            onClose: closeArchive,
        }),
        [archiveParam, archiveTarget, isSubmittingArchive, confirmArchive, closeArchive]
    );

    const restoreContext: ArchiveRestoreModalContext = useMemo(
        () => ({
            isOpen: Boolean(restoreParam && restoreTarget),
            walletName: restoreTarget?.name ?? "",
            entityName: restoreTarget?.name ?? "",
            itemName: restoreTarget?.name ?? "",
            isSubmitting: isSubmittingRestore,
            onConfirm: confirmRestore,
            onClose: closeRestore,
        }),
        [restoreParam, restoreTarget, isSubmittingRestore, confirmRestore, closeRestore]
    );

    return {
        onArchive,
        onRestore,
        archiveContext,
        restoreContext,
        achiveContext: archiveContext,
    };
}