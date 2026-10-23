import React from "react";
import { ContractSummaryItem } from "../../../core/schemas/contract.schema";
import { ContractListItem } from "./item";
import { cn } from "cn";

interface ContractListProps {
  items: ContractSummaryItem[];
  onActionClick: (contract: ContractSummaryItem) => void;
  onToggleProjection: (contract: ContractSummaryItem) => void;
  onSelect?: (contract: ContractSummaryItem) => void;
  className?: string;
}

export function ContractList({
  items,
  onActionClick,
  onToggleProjection,
  onSelect,
  className
}: ContractListProps) {
  if (items.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 text-center text-muted-foreground", className)}>
        <p>Nenhum contrato encontrado.</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full flex flex-col divide-y divide-border border-y border-border", className)}>
      {items.map((item) => (
        <ContractListItem
          key={item.id}
          contract={item}
          onSelect={() => onSelect?.(item)}
          onOpenActions={() => onActionClick(item)}
          onToggleProjection={onToggleProjection}
        />
      ))}
    </div>
  );
}
