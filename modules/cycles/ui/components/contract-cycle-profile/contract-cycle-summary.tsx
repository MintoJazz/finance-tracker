"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ContractCycleProfile } from "@/modules/cycles/models/contract-cycle.schema";
import { ContractCycleActionContext } from "./contract-cycle-actions";
import { ContractCycleNavigator } from "./contract-cycle-navigator";
import { ContractCycleDetails } from "./contract-cycle-details";

export interface ContractCycleSummaryProps {
    cycle: ContractCycleProfile;
    cycleActionContext?: ContractCycleActionContext;
    onSkip?: (cycle: ContractCycleProfile) => void;
    className?: string;
    children?: React.ReactNode;
}

export function ContractCycleSummary({
    cycle,
    cycleActionContext,
    onSkip,
    className,
    children,
}: ContractCycleSummaryProps) {
    return (
        <Card
            className={cn(
                "overflow-hidden bg-card shadow-2xs w-full",
                className
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-muted/30 border-b">
                <ContractCycleNavigator cycle={cycle} />
            </CardHeader>

            <CardContent className="flex flex-col items-center text-center p-5 sm:p-7 gap-5 w-full">
                <ContractCycleDetails
                    cycle={cycle}
                    cycleActionContext={cycleActionContext}
                    onSkip={onSkip}
                >
                    {children}
                </ContractCycleDetails>
            </CardContent>
        </Card>
    );
}

export default ContractCycleSummary;
