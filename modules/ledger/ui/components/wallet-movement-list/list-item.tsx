import { Calendar, MoreHorizontal, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { WalletMovement } from "@/modules/ledger/core/schemas/wallet-movement.schema";
import { MovementAmountSpan } from "../movement-amount-span";
import { MOVEMENT_TYPE_UI_CONFIG } from "../wallet-movements-actions-menu";

interface WalletMovementListItemProps {
    movement: WalletMovement;
    onOpenActions: () => void;
    className?: string;
}

export function WalletMovementListItem({
    movement,
    onOpenActions,
    className,
}: WalletMovementListItemProps) {
    const { description, date, type, direction, amount, isReversed, hasReceipt } = movement;
    const config = MOVEMENT_TYPE_UI_CONFIG[type];
    const IconComponent = config.icon;

    return (
        <div
            data-slot="item"
            className={cn(
                "group/item flex w-full flex-col gap-2 px-4 sm:px-5 py-3.5 hover:bg-muted/30 transition-colors text-sm",
                isReversed && "opacity-75",
                className
            )}
        >
            {/* Linha 1: Ícone + Descrição + Recibo/Estorno + Botão de Ações */}
            <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                        className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 select-none",
                            config.iconClassName
                        )}
                    >
                        <IconComponent className="size-4" />
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span
                            className={cn(
                                "truncate font-medium text-foreground text-sm",
                                isReversed && "line-through text-muted-foreground"
                            )}
                        >
                            {description}
                        </span>
                        {hasReceipt && (
                            <span title="Possui comprovante anexo">
                                <Paperclip className="size-3.5 text-muted-foreground shrink-0" />
                            </span>
                        )}
                        {isReversed && (
                            <Badge
                                variant="outline"
                                className="text-[10px] text-muted-foreground border-dashed shrink-0"
                            >
                                Estornada
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenActions();
                        }}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Linha 2: Data + Tipo à esquerda, Valor com sinal e cor à direita */}
            <div className="flex items-center justify-between gap-3 w-full text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 min-w-0">
                    <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                    <span>{formatDate(new Date(date))}</span>
                    <span>•</span>
                    <Badge
                        variant="outline"
                        className={cn("text-[10px] px-1.5 py-0 font-normal", config.badgeClassName)}
                    >
                        {config.label}
                    </Badge>
                </div>
                <MovementAmountSpan
                    amount={amount}
                    direction={direction}
                    isReversed={isReversed}
                />
            </div>
        </div>
    );
}

export default WalletMovementListItem;