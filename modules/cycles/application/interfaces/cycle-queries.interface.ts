export interface CycleRuleItem {
    id: number;
    agreementId: number;
    effectiveFrom: Date;
    effectiveTo: Date | null;
    frequency: "ONCE" | "WEEKLY" | "MONTHLY" | "YEARLY";
    interval: number;
    closingDay: number | null;
    dueDay: number;
}

export interface CycleRulesWindowData {
    balance: {
        id: number;
        name: string;
        balanceType: "CREDIT" | "PAYABLE" | "RECEIVABLE" | "WALLET" | "RESERVE" | "CATEGORY";
        contextId: number;
    };
    agreement: {
        startsAt: Date;
        endsAt: Date | null;
        includeInProjection: boolean;
    };
    rules: CycleRuleItem[];
    amountLog: Array<{
        amount: number;
        effectiveAt: Date;
    }>;
}

export interface CycleAggregatedAmounts {
    movementsCount: number;
    recognizedSignedAmount: number;
    settledSignedAmount: number;
    transferredSignedAmount: number;
    netSignedAmount: number;
    hasSettlementReceipt: boolean;
    latestSettlementDate: Date | null;
}

export interface ICycleQueries {
    findAdjacentCycleRules(
        contextId: number,
        balanceId: number,
        from: Date,
        to: Date
    ): Promise<CycleRulesWindowData | null>;

    aggregateCycleAmounts(
        balanceId: number,
        from: Date,
        to: Date,
        isOnce?: boolean,
        balanceType?: CycleRulesWindowData["balance"]["balanceType"]
    ): Promise<CycleAggregatedAmounts>;
}
