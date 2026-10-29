"use client";

import * as React from "react";
import { ActionsDrawer } from "@/components/actions/drawer";
import { CycleEntryRow } from "@/modules/cycles/models/contract-cycle.schema";
import {
    buildCycleEntryActions,
    CycleEntryActionContext,
} from "./actions";
import { ContractCycleEntryActionsDrawerHeader } from "./header";

export interface ContractCycleEntryActionsDrawerProps {
    entry?: CycleEntryRow | null;
    context: CycleEntryActionContext;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactElement | null;
}

export function ContractCycleEntryActionsDrawer({
    entry,
    context,
    open,
    onOpenChange,
    trigger,
}: ContractCycleEntryActionsDrawerProps) {
    const actions = React.useMemo(
        () => buildCycleEntryActions(),
        []
    );

    return (
        <ActionsDrawer
            open={open}
            onOpenChange={onOpenChange}
            row={entry ?? undefined}
            actions={actions}
            context={context}
            trigger={trigger}
            header={
                entry ? (
                    <ContractCycleEntryActionsDrawerHeader entry={entry} />
                ) : null
            }
        />
    );
}

export default ContractCycleEntryActionsDrawer;
