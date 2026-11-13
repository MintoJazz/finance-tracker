export interface CycleSummaryLabels {
    total: string;
    period: string;
    dueDate: string;
    paid: string;
    open: string;
}

export interface CycleSummaryProps {
    labels: CycleSummaryLabels;
    total: number;
    paid: number;
    open: number;
    period: string;
    dueDate: string;
    isLoading?: boolean;
    className?: string;
}

