"use client";

import * as React from "react";
import { ActionsDrawer } from "@/components/actions/drawer";
import type { RowAction } from "@/types/actions.types";
import type { InstallmentListItem } from "@/modules/installments/models/schemas/installment-item.schema";
import { INSTALLMENT_ACTIONS, type InstallmentActionContext } from "./actions";
import { InstallmentActionsDrawerHeader } from "./header";

export interface InstallmentActionsDrawerProps {
    installment?: InstallmentListItem | null;
    context?: InstallmentActionContext;
    actions?: RowAction<InstallmentListItem, InstallmentActionContext>[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactElement | null;
}

export function InstallmentActionsDrawer({
    installment,
    context,
    actions = INSTALLMENT_ACTIONS,
    open,
    onOpenChange,
    trigger = null,
}: InstallmentActionsDrawerProps) {
    return (
        <ActionsDrawer
            open={open}
            onOpenChange={onOpenChange}
            row={installment ?? undefined}
            actions={actions}
            context={context}
            trigger={trigger}
            header={
                installment ? (
                    <InstallmentActionsDrawerHeader installment={installment} />
                ) : null
            }
        />
    );
}

export default InstallmentActionsDrawer;
export * from "./actions";
export * from "./header";
