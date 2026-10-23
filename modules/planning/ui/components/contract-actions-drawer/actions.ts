import { RowAction } from "@/types/actions.types";
import { ContractSummaryItem } from "../../../core/schemas/contract.schema";
import { Archive, PauseCircle, Pencil, PlayCircle, RotateCcw } from "lucide-react";

export interface ContractActionContext {
  onToggleProjection: (contract: ContractSummaryItem) => void;
  onArchive: (contract: ContractSummaryItem) => void;
  onRestore?: (contract: ContractSummaryItem) => void;
  onEdit?: (contract: ContractSummaryItem) => void;
}

export const CONTRACT_ACTIONS: RowAction<ContractSummaryItem, ContractActionContext>[] = [
  {
    id: "edit",
    label: "Editar",
    icon: Pencil,
    onClick: (row, context) => context?.onEdit?.(row.original),
    hidden: (row) => !contextIsDefined(row) || row.original.isArchived,
  },
  {
    id: "pause",
    label: "Pausar",
    icon: PauseCircle,
    onClick: (row, context) => context?.onToggleProjection(row.original),
    hidden: (row) => !row.original.includeInProjection || row.original.isArchived,
  },
  {
    id: "play",
    label: "Ativar",
    icon: PlayCircle,
    onClick: (row, context) => context?.onToggleProjection(row.original),
    hidden: (row) => row.original.includeInProjection || row.original.isArchived,
  },
  {
    id: "restore",
    label: "Restaurar",
    icon: RotateCcw,
    onClick: (row, context) => context?.onRestore?.(row.original),
    hidden: (row) => !row.original.isArchived,
  },
  {
    id: "archive",
    label: "Arquivar",
    icon: Archive,
    variant: "destructive",
    onClick: (row, context) => context?.onArchive(row.original),
    hidden: (row) => row.original.isArchived,
  },
];

function contextIsDefined(row: { original: ContractSummaryItem }): boolean {
  return !!row.original;
}
