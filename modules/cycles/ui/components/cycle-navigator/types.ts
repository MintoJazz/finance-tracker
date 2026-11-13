export type CycleStatusTone = "destructive" | "amber" | "emerald" | "neutral";

export interface CycleNavigatorStatus {
    label: string;
    tone: CycleStatusTone;
}

export interface CycleNavigatorProps {
    title: string;
    status: CycleNavigatorStatus;
    canPrev: boolean;
    canNext: boolean;
    onPrev: () => void;
    onNext: () => void;
    isLoading?: boolean;
    className?: string;
}

