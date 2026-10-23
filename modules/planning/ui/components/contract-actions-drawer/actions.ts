import { RowAction } from "@/types/actions.types";
import { ContractSummaryItem } from "../../../core/schemas/contract.schema";
import { Archive, PauseCircle, PlayCircle } from "lucide-react";

export interface ContractActionContext {
  onToggleProjection: (contract: ContractSummaryItem) => void;
  onArchive: (contract: ContractSummaryItem) => void;
}

export const CONTRACT_ACTIONS: RowAction<ContractSummaryItem, ContractActionContext>[] = [
  {
    id: "pause",
    label: "Pausar",
    icon: PauseCircle,
    onClick: (row, context) => context?.onToggleProjection(row.original),
    hidden: (row) => !row.original.includeInProjection,
  },
  {
    id: "play",
    label: "Ativar",
    icon: PlayCircle,
    onClick: (row, context) => context?.onToggleProjection(row.original),
    hidden: (row) => row.original.includeInProjection,
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
