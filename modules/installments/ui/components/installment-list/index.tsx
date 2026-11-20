"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Page } from "@/types/pagination.types";
import type { InstallmentListItem as InstallmentListItemType } from "@/modules/installments/models/schemas/installment-item.schema";
import {
    InstallmentActionsDrawer,
    type InstallmentActionContext,
} from "../installment-actions-drawer";
import EmptyInstallmentList from "./empty";
import InstallmentListItem from "./list-item";

interface Props {
    data: Page<InstallmentListItemType> | InstallmentListItemType[];
    actionContext: InstallmentActionContext;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    className?: string;
}

export default function InstallmentList({
    data,
    actionContext,
    hasFilters = false,
    onClearFilters,
    className,
}: Props) {
    const items = Array.isArray(data) ? data : data.data;
    const [activeInstallment, setActiveInstallment] =
        useState<InstallmentListItemType | null>(null);

    if (items.length === 0) {
        return (
            <div className={cn("px-4", className)}>
                <EmptyInstallmentList
                    hasFilters={hasFilters}
                    onClearFilters={onClearFilters}
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "w-full flex flex-col divide-y divide-border border-y border-border",
                className
            )}
        >
            {items.map((installment) => (
                <InstallmentListItem
                    key={installment.id}
                    installment={installment}
                    onSelect={
                        actionContext.onView
                            ? () => actionContext.onView?.(installment)
                            : undefined
                    }
                    onOpenActions={() => setActiveInstallment(installment)}
                />
            ))}

            <InstallmentActionsDrawer
                open={Boolean(activeInstallment)}
                onOpenChange={(open) => {
                    if (!open) setActiveInstallment(null);
                }}
                installment={activeInstallment}
                context={actionContext}
                trigger={null}
            />
        </div>
    );
}
