import { Calendar, MoreHorizontal } from "lucide-react";
import { AmountSpan } from "@/components/amount-span";
import { Button } from "@/components/ui/button";
import {
    ListItem,
    ListItemActions,
    ListItemAvatar,
    ListItemContent,
    ListItemFooter,
    ListItemFooterInfo,
    ListItemFooterLeft,
    ListItemFooterRight,
    ListItemHeader,
    ListItemSubtitle,
    ListItemTitle,
} from "@/components/list-item";
import { formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
    getRemainingAmount,
    isInstallmentPaid,
    type InstallmentListItem as InstallmentListItemType,
} from "@/modules/installments/models/schemas/installment-item.schema";
import {
    formatInstallmentNextDue,
    getInstallmentSourceLabel,
} from "@/modules/installments/ui/themes/installment.themes";
import { InstallmentAvatar } from "../installment-avatar";
import { InstallmentProgressRing } from "../installment-progress";
import { InstallmentStatusBadge } from "../installment-status-badge";

interface Props {
    installment: InstallmentListItemType;
    className?: string;
    onOpenActions: () => void;
    onSelect?: () => void;
}

export default function InstallmentListItem({
    installment,
    className,
    onOpenActions,
    onSelect,
}: Props) {
    const { description, installmentAmount, category } = installment;
    const paid = isInstallmentPaid(installment);
    const remaining = getRemainingAmount(installment);

    return (
        <ListItem
            onSelect={onSelect}
            className={cn(paid && "opacity-75", className)}
        >
            <ListItemHeader>
                <ListItemAvatar>
                    <InstallmentAvatar item={installment} size="md" />
                </ListItemAvatar>
                <ListItemContent>
                    <ListItemTitle>
                        <span
                            className={cn(
                                "truncate font-medium text-foreground text-sm",
                                paid && "text-muted-foreground"
                            )}
                            title={description}
                        >
                            {description}
                        </span>
                        <InstallmentStatusBadge
                            item={installment}
                            className="shrink-0"
                        />
                    </ListItemTitle>
                    <ListItemSubtitle>
                        {category?.name ?? "Sem categoria"} ·{" "}
                        {getInstallmentSourceLabel(installment)}
                    </ListItemSubtitle>
                </ListItemContent>
                <ListItemActions>
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenActions();
                        }}
                        aria-label={`Ações de ${description}`}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </ListItemActions>
            </ListItemHeader>

            <ListItemFooter>
                <ListItemFooterLeft>
                    <InstallmentProgressRing item={installment} />
                    <ListItemFooterInfo icon={Calendar}>
                        {formatInstallmentNextDue(installment, {
                            withPrefix: true,
                        })}
                    </ListItemFooterInfo>
                </ListItemFooterLeft>
                <ListItemFooterRight className="flex flex-col items-end">
                    <AmountSpan
                        amount={installmentAmount}
                        isNegative={!paid}
                        isCancelled={paid}
                    />
                </ListItemFooterRight>
            </ListItemFooter>
        </ListItem>
    );
}
