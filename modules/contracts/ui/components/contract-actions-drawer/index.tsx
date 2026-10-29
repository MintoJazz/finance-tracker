"use client";

import * as React from "react";
import { ActionsDrawer } from "@/components/actions/drawer";
import { RowAction } from "@/types/actions.types";
import { ContractSummaryItem } from "@/modules/contracts/models/contract.schema";
import { CONTRACT_ACTIONS, ContractActionContext } from "./actions";
import { ContractActionsDrawerHeader } from "./header";

export interface ContractActionsDrawerProps {
  contract?: ContractSummaryItem | null;
  context?: ContractActionContext;
  actions?: RowAction<ContractSummaryItem, ContractActionContext>[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement | null;
}

export function ContractActionsDrawer({
  contract,
  context,
  actions = CONTRACT_ACTIONS,
  open,
  onOpenChange,
  trigger,
}: ContractActionsDrawerProps) {
  return (
    <ActionsDrawer
      open={open}
      onOpenChange={onOpenChange}
      row={contract ?? undefined}
      actions={actions}
      context={context}
      trigger={trigger}
      header={contract ? <ContractActionsDrawerHeader contract={contract} /> : null}
    />
  );
}

export default ContractActionsDrawer;
export * from "./actions";
export * from "./header";
