"use client";

import * as React from "react";
import { RowAction } from "@/types/actions.types";
import {
    COMMITMENT_CYCLE_ACTIONS,
    CommitmentCycleActionContext,
} from "./actions";
import { CommitmentCycleActionsDrawerHeader } from "./header";
import { ActionsDrawer, ActionsDrawerProps } from "@/components/actions/drawer";
import { CommitmentCycleItem } from "@/modules/planning/core/schemas/commitment-cycle.schema";

interface CommitmentCycleActionsDrawerProps
    extends Omit<
        ActionsDrawerProps<CommitmentCycleItem, CommitmentCycleActionContext>,
        "row" | "actions" | "header" | "trigger"
    > {
    item: CommitmentCycleItem | null;
    actions?: RowAction<CommitmentCycleItem, CommitmentCycleActionContext>[];
    trigger?: React.ReactElement | null;
}

export function CommitmentCycleActionsDrawer({
    item,
    actions = COMMITMENT_CYCLE_ACTIONS,
    context,
    trigger,
    ...props
}: CommitmentCycleActionsDrawerProps) {
    if (!item) return null;

    return (
        <ActionsDrawer
            row={item}
            actions={actions}
            context={context}
            trigger={trigger}
            header={<CommitmentCycleActionsDrawerHeader item={item} />}
            {...props}
        />
    );
}

export * from "./actions";
export * from "./header";
export default CommitmentCycleActionsDrawer;