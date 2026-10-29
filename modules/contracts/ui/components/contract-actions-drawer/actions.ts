import { actionsToCatalog } from "@/components/actions/catalog";
import { RowAction, ActionCatalog } from "@/types/actions.types";
import { ContractSummaryItem } from "@/modules/contracts/models/contract.schema";
import { Archive, CalendarClock, Coins, PauseCircle, PencilLine, PlayCircle, RotateCcw } from "lucide-react";

export interface ContractActionContext {
  onToggleProjection: (contract: ContractSummaryItem) => void;
  onArchive: (contract: ContractSummaryItem) => void;
  onRestore?: (contract: ContractSummaryItem) => void;
  onEdit?: (contract: ContractSummaryItem) => void;
  onRename?: (contract: ContractSummaryItem) => void;
  onAdjustSchedule?: (contract: ContractSummaryItem) => void;
  onAdjustLimits?: (contract: ContractSummaryItem) => void;
}

export const CONTRACT_ACTIONS: RowAction<ContractSummaryItem, ContractActionContext>[] = [
  {
    id: "rename",
    label: "Renomear",
    icon: PencilLine,
    onClick: (row, context) => context?.onRename?.(row.original),
    hidden: (row) => !contextIsDefined(row) || row.original.isArchived,
  },
  {
    id: "adjust-schedule",
    label: "Ajustar prazos",
    icon: CalendarClock,
    onClick: (row, context) => context?.onAdjustSchedule?.(row.original),
    hidden: (row) => !contextIsDefined(row) || row.original.isArchived,
  },
  {
    id: "adjust-limits",
    label: "Ajustar limites",
    icon: Coins,
    onClick: (row, context) => context?.onAdjustLimits?.(row.original),
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

const { pause, play, ...defaultContractActions } = actionsToCatalog(
  CONTRACT_ACTIONS
);

const CONTRACT_PROFILE_SPECIFIC_ACTIONS: ActionCatalog<
  ContractSummaryItem,
  ContractActionContext
> = {
  pause: {
    ...pause,
    disabled: (row) => row.original.isArchived,
    hidden: (row) => !row.original.includeInProjection,
  },
  play: {
    ...play,
    disabled: (row) => row.original.isArchived,
    hidden: (row) => row.original.includeInProjection,
  },
};

export const CONTRACT_PROFILE_ACTIONS: ActionCatalog<
  ContractSummaryItem,
  ContractActionContext
> = {
  ...CONTRACT_PROFILE_SPECIFIC_ACTIONS,
  ...defaultContractActions,
};

function contextIsDefined(row: { original: ContractSummaryItem }): boolean {
  return !!row.original;
}
