import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import { WALLET_ACTIONS, WalletActionContext } from "../../config/wallet-actions-menu";
import { ActionsMenu } from "@/components/actions-menu";
import { AmountSpan } from "@/components/amount-span";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatters";
import { Calendar } from "lucide-react";
import { cn } from "cn";
import BalanceAvatar from "../balance-avatar";

interface Props {
    wallet: WalletSummary;
    context: WalletActionContext;
    className?: string;
}

export default function WalletListItem({ wallet, context, className }: Props) {
    const { name, amount, lastActivityAt, isArchived } = wallet;

    return (
        <div
            data-slot="item"
            className={cn(
                "group/item flex w-full flex-col gap-2 px-4 py-3 hover:bg-muted/40 transition-colors text-sm",
                isArchived && "opacity-75",
                className
            )}
        >
            <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <BalanceAvatar name={name} isArchived={isArchived} size="md" />
                    <div className="flex items-center gap-2 min-w-0">
                        <span
                            className={cn(
                                "truncate font-medium text-foreground text-sm",
                                isArchived && "text-muted-foreground"
                            )}
                        >
                            {name}
                        </span>
                        {isArchived && (
                            <Badge variant="outline" className="text-muted-foreground">
                                Arquivada
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <ActionsMenu row={wallet} actions={WALLET_ACTIONS} context={context} />
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 w-full text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 min-w-0">
                    <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                        {lastActivityAt
                            ? `Última atividade: ${formatDate(new Date(lastActivityAt))}`
                            : "Sem atividade recente"}
                    </span>
                </div>

                <AmountSpan
                    amount={amount}
                    isNegative={amount < 0}
                    isPositive={amount > 0}
                    isCancelled={isArchived}
                />
            </div>
        </div>
    );
}