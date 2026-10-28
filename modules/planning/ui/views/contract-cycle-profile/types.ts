import {
    ContractCycleProfile,
    CycleEntryRow,
} from "../../../core/schemas/contract-cycle.schema";

export interface ContractCycleProfileInput {
    contractId: number;
    cycle: ContractCycleProfile | null;
    entries: CycleEntryRow[];
    isLoading?: boolean;
    error?: string | null;
}

export interface ContractCycleProfileDesktopProps {
    cycle: ContractCycleProfile | null;
    entries: CycleEntryRow[];
    isLoading?: boolean;
    error?: string | null;
    onSkip?: (cycle: ContractCycleProfile) => void;
    onViewEntry?: (entry: CycleEntryRow) => void;
    onReverseEntry?: (entry: CycleEntryRow) => void;
}

export interface ContractCycleProfileMobileProps {
    cycle: ContractCycleProfile | null;
    entries: CycleEntryRow[];
    isLoading?: boolean;
    error?: string | null;
    onSkip?: (cycle: ContractCycleProfile) => void;
    onViewEntry?: (entry: CycleEntryRow) => void;
    onReverseEntry?: (entry: CycleEntryRow) => void;
}
