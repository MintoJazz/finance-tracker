import { Calendar, MoreHorizontal, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { WalletMovement } from "@/modules/ledger/core/schemas/wallet-movement.schema";
import {
    ListItem,
    ListItemHeader,
    ListItemAvatar,
    ListItemContent,
    ListItemTitle,
    ListItemActions,
    ListItemFooter,
    ListItemFooterLeft,
    ListItemFooterRight,
    ListItemFooterInfo,
} from "@/components/list-item";
import { MOVEMENT_TYPE_UI_CONFIG } from "../../themes/movement-type";
import {
    CategoryAvatar,
    getCategorySubtitle,
} from "../category-badge";

interface CreditMovementListItemProps {
    movement: WalletMovement;
    onOpenActions: () => void;
    className?: string;
}

export function CreditMovementListItem({
    movement,
    onOpenActions,
    className,
}: CreditMovementListItemProps) {
    const {
        description,
        date,
        type,
        direction,
        amount,
        isReversed,
        hasReceipt,
        categoryClassification,
    } = movement;

    const isCreditOnInvoice = direction === "CREDIT" || type === "REVERSAL";
    const categorySubtitle = getCategorySubtitle(categoryClassification);
    const subtitle = isCreditOnInvoice
        ? categoryClassification && categoryClassification.kind !== "none"
            ? `${categorySubtitle} • Crédito na fatura`
            : "Crédito na fatura"
        : categorySubtitle;

    const { icon: Icon, label } = MOVEMENT_TYPE_UI_CONFIG[type] ?? {
        icon: Calendar,
        label: isCreditOnInvoice ? "Crédito" : "Compra",
    };

    return (
        <ListItem className={cn(isReversed && "opacity-75", className)}>
            <ListItemHeader>
                <ListItemAvatar>
                    <CategoryAvatar
                        classification={categoryClassification}
                        size="md"
                    />
                </ListItemAvatar>
                <ListItemContent>
                    <ListItemTitle>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                    className={cn(
                                        "truncate font-medium text-foreground text-sm",
                                        isReversed && "line-through text-muted-foreground"
                                    )}
                                    title={description}
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
                            <span
                                className="text-xs text-muted-foreground truncate font-normal"
                                title={subtitle}
                            >
                                {subtitle}
                            </span>
                        </div>
                    </ListItemTitle>
                </ListItemContent>
                <ListItemActions>
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
                </ListItemActions>
            </ListItemHeader>

            <ListItemFooter>
                <ListItemFooterLeft>
                    <ListItemFooterInfo icon={Calendar}>
                        {formatDate(new Date(date))}
                    </ListItemFooterInfo>
                    <ListItemFooterInfo icon={Icon}>
                        {isCreditOnInvoice ? "Crédito na fatura" : label}
                    </ListItemFooterInfo>
                </ListItemFooterLeft>
                <ListItemFooterRight>
                    <span
                        className={cn(
                            "font-medium font-mono tabular-nums text-sm",
                            isCreditOnInvoice && "text-emerald-500",
                            isReversed && "line-through opacity-50"
                        )}
                    >
                        {isCreditOnInvoice ? `- ${formatMoney(amount)}` : formatMoney(amount)}
                    </span>
                </ListItemFooterRight>
            </ListItemFooter>
        </ListItem>
    );
}

export default CreditMovementListItem;
