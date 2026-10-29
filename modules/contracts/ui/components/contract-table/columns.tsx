"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ContractSummaryItem } from "@/modules/contracts/models/contract.schema";
import { AmountSpan } from "@/components/amount-span";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ContractActionContext } from "../contract-actions-drawer";
import { PauseCircle, PlayCircle } from "lucide-react";
import { cn } from "cn";
import {
  formatContractDueDay,
  FREQUENCY_LABELS,
} from "@/modules/contracts/ui/formatters/contract-schedule.formatter";

export function getContractColumns(
  actionContext: ContractActionContext
): ColumnDef<ContractSummaryItem>[] {
  return [
    {
      accessorKey: "name",
      header: "Contrato",
      cell: ({ row }) => {
        const includeInProjection = row.original.includeInProjection;
        
        const startStr = format(row.original.startsAt, "dd/MM/yyyy");
        let durationStr = `Desde ${startStr}`;
        if (row.original.endsAt) {
          const endStr = format(row.original.endsAt, "dd/MM/yyyy");
          durationStr = `${startStr} até ${endStr}`;
        }
        
        return (
          <div className="flex items-center gap-3 max-w-[20rem] truncate">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 shrink-0 rounded-full",
                includeInProjection ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={(e) => {
                e.stopPropagation();
                actionContext.onToggleProjection(row.original);
              }}
            >
              {includeInProjection ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
            </Button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("font-medium truncate", row.original.isArchived && "text-muted-foreground")}>{row.original.name}</span>
                {row.original.isArchived && (
                  <div className="rounded-md border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    Arquivado
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground truncate">{durationStr}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "frequency",
      header: "Frequência",
      cell: ({ row }) => {
        const freq = row.original.frequency;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{FREQUENCY_LABELS[freq] || freq}</span>
            <span className="text-xs text-muted-foreground">{formatContractDueDay(row.original)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "value",
      header: () => <div className="text-right">Valor</div>,
      cell: ({ row }) => {
        const isPayable = row.original.type === "PAYABLE";
        return (
          <div className="flex flex-col items-end">
            <span className={cn("font-medium font-mono tabular-nums", row.original.isArchived && "text-muted-foreground")}>
              <AmountSpan amount={row.original.value} isNegative={isPayable && !row.original.isArchived} isPositive={!isPayable && !row.original.isArchived} isCancelled={row.original.isArchived} />
            </span>
            <span className="text-xs text-muted-foreground">
              {isPayable ? "A Pagar" : "A Receber"}
            </span>
          </div>
        );
      },
    },
  ];
}
