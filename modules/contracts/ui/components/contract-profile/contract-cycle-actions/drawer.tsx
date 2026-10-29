"use client";

import * as React from "react";
import { ActionsDrawer } from "@/components/actions/drawer";
import { RowAction } from "@/types/actions.types";
import { ContractCycleItem } from "@/modules/cycles/models/contract-cycle.schema";
import { CONTRACT_CYCLE_ACTIONS, ContractCycleActionContext } from "./actions";
import { ContractCycleActionsDrawerHeader } from "./header";

export interface ContractCycleActionsDrawerProps {
    cycle?: ContractCycleItem | null;
    isPayable: boolean;
    context?: ContractCycleActionContext;
    actions?: RowAction<ContractCycleItem, ContractCycleActionContext>[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactElement | null;
}

export function ContractCycleActionsDrawer({
    cycle,
    isPayable,
    context,
    actions = CONTRACT_CYCLE_ACTIONS,
    open,
    onOpenChange,
    trigger,
}: ContractCycleActionsDrawerProps) {
    return (
        <ActionsDrawer
            open={open}
            onOpenChange={onOpenChange}
            row={cycle ?? undefined}
            actions={actions}
            context={context}
            trigger={trigger}
            header={
                cycle ? (
                    <ContractCycleActionsDrawerHeader
                        cycle={cycle}
                        isPayable={isPayable}
                    />
                ) : null
            }
        />
    );
}

export default ContractCycleActionsDrawer;
