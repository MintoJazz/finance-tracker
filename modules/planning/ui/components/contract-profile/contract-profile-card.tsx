"use client";

import * as React from "react";
import { AlertTriangle, Eye, EyeOff, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    ProfileCard,
    ProfileCardAvatar,
    ProfileCardBanner,
    ProfileCardContent,
} from "@/components/profile-card";
import { getHashColorStyle } from "@/lib/avatar-utils";
import { formatDate, formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { ContractProfile } from "../../../core/schemas/contract-profile.schema";
import { getFrequencyTheme } from "../../themes/frequency-type.theme";
import { ContractQuickActions } from "./contract-quick-actions";
import { ContractActionContext } from "../contract-actions-drawer";

interface ContractProfileCardProps {
    contract: ContractProfile;
    contractActionsContext?: ContractActionContext;
    className?: string;
    children?: React.ReactNode;
}

export function ContractProfileCard({
    contract,
    contractActionsContext,
    className,
    children,
}: ContractProfileCardProps) {
    const [isVisible, setIsVisible] = React.useState(true);

    const hashStyle = getHashColorStyle(contract.name || "C");
    const theme = getFrequencyTheme(contract.frequency);
    const isPayable = contract.type === "PAYABLE";

    const validityText = React.useMemo(() => {
        const startStr = formatDate(contract.startsAt);
        if (contract.endsAt) {
            return `${startStr} até ${formatDate(contract.endsAt)}`;
        }
        return `Desde ${startStr}`;
    }, [contract.startsAt, contract.endsAt]);

    const dueDayText = theme.formatDueDay({
        dueDay: contract.dueDay,
        dueMonth: contract.dueMonth,
        startsAt: contract.startsAt,
    });

    const closingDayText = theme.formatClosingDay({
        closingDay: contract.closingDay,
        closingMonth: contract.closingMonth,
    });

    const { summary } = contract;
    const totalConsolidated = summary.totalPaid + summary.totalPending;
    const progressPercent =
        totalConsolidated > 0
            ? Math.min(100, Math.max(0, Math.round((summary.totalPaid / totalConsolidated) * 100)))
            : 0;

    return (
        <ProfileCard isArchived={contract.isArchived} className={className}>
            {/* Banner com gradiente e hash de cor */}
            <ProfileCardBanner style={{ backgroundColor: hashStyle.backgroundColor }}>
                <ProfileCardAvatar
                    style={{ borderColor: hashStyle.color }}
                    isArchived={contract.isArchived}
                >
                    <ReceiptText
                        className="size-6 text-muted-foreground stroke-[1.75]"
                        color={hashStyle.color}
                    />
                </ProfileCardAvatar>
            </ProfileCardBanner>

            <ProfileCardContent>
                {/* Nome do Contrato + Badges de Natureza e Estado */}
                <div className="flex flex-col items-center justify-center text-center gap-1">
                    <div className="flex items-center justify-center gap-1.5 max-w-full">
                        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate">
                            {contract.name}
                        </h2>
                        {contract.isArchived && (
                            <Badge
                                variant="outline"
                                className="text-[10px] py-0 px-1 text-amber-700 dark:text-amber-400 border-amber-500/30 shrink-0"
                            >
                                Arquivado
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-center text-xs">
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-[10px] py-0 px-1.5 font-medium shrink-0",
                                isPayable
                                    ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            )}
                        >
                            {isPayable ? "A Pagar" : "A Receber"}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={cn("text-[10px] py-0 px-1.5 font-medium shrink-0", theme.badgeClassName)}
                        >
                            {theme.label}
                        </Badge>
                    </div>

                    <span className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                        {dueDayText}
                        {closingDayText ? ` • ${closingDayText}` : ""}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {validityText}
                    </span>
                </div>

                {/* Seção do Valor Recorrente da Parcela */}
                <div className="flex flex-col gap-1 pt-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                            Valor Recorrente
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsVisible((v) => !v)}
                            className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-full transition-colors"
                            aria-label={isVisible ? "Ocultar valor" : "Mostrar valor"}
                        >
                            {isVisible ? (
                                <Eye className="size-3.5 sm:size-4" />
                            ) : (
                                <EyeOff className="size-3.5 sm:size-4" />
                            )}
                        </button>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                        <div
                            className={cn(
                                "text-2xl sm:text-[26px] font-bold tracking-tight tabular-nums transition-colors text-foreground",
                                contract.isArchived && "opacity-75"
                            )}
                        >
                            {isVisible ? formatMoney(contract.value) : "R$ ••••••"}
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {theme.recurrenceSuffix}
                        </span>
                    </div>

                    {/* Barra de Progresso de Quitação dos Ciclos Realizados */}
                    <div className="flex flex-col gap-1.5 pt-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-300",
                                    isPayable ? "bg-rose-500" : "bg-emerald-500"
                                )}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
                            <span>
                                {isPayable ? "Pago: " : "Recebido: "}
                                <strong className="font-medium text-foreground">
                                    {isVisible ? formatMoney(summary.totalPaid) : "R$ ••••"}
                                </strong>
                            </span>
                            <span>
                                Pendente:{" "}
                                <strong className="font-medium text-foreground">
                                    {isVisible ? formatMoney(summary.totalPending) : "R$ ••••"}
                                </strong>
                            </span>
                        </div>

                        {/* Alerta de Atraso */}
                        {summary.overdueCount > 0 && (
                            <div className="mt-1 flex items-center justify-between gap-2 rounded-lg border border-rose-500/25 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-700 dark:text-rose-400">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <AlertTriangle className="size-3.5 shrink-0" />
                                    <span className="truncate font-medium">
                                        {summary.overdueCount}{" "}
                                        {summary.overdueCount === 1 ? "ciclo vencido" : "ciclos vencidos"}
                                    </span>
                                </div>
                                <span className="font-mono font-semibold tabular-nums shrink-0">
                                    {isVisible ? formatMoney(summary.overdueAmount) : "R$ ••••"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Botões de Ação Rápida */}
                <ContractQuickActions
                    contract={contract}
                    contractActionsContext={contractActionsContext}
                />
            </ProfileCardContent>
            {children}
        </ProfileCard>
    );
}

export default ContractProfileCard;
