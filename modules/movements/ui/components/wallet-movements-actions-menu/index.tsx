"use client";

import * as React from "react";
import { ActionsDrawer } from "@/components/actions/drawer";
import { WalletMovement } from "@/modules/movements/models/wallet-movement.schema";
import { MOVEMENT_ACTIONS, MovementActionContext } from "./actions";
import { WalletMovementActionsDrawerHeader } from "./header";

export interface WalletMovementActionsDrawerProps {
    movement?: WalletMovement | null;
    context?: MovementActionContext;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactElement | null;
}

export function WalletMovementActionsDrawer({
    movement,
    context,
    open,
    onOpenChange,
    trigger,
}: WalletMovementActionsDrawerProps) {
    return (
        <ActionsDrawer
            open={open}
            onOpenChange={onOpenChange}
            row={movement ?? undefined}
            actions={MOVEMENT_ACTIONS}
            context={context}
            trigger={trigger}
            header={
                movement ? (
                    <WalletMovementActionsDrawerHeader movement={movement} />
                ) : null
            }
        />
    );
}

export default WalletMovementActionsDrawer;
export * from "./actions";
export * from "./header";