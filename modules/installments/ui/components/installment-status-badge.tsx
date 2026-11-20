import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    getInstallmentStatus,
    type InstallmentItemStatus,
    type InstallmentListItem,
} from "@/modules/installments/models/schemas/installment-item.schema";
import { INSTALLMENT_STATUS_THEMES } from "@/modules/installments/ui/themes/installment.themes";

export interface InstallmentStatusBadgeProps {
    item?: Pick<
        InstallmentListItem,
        "paidInstallments" | "totalInstallments" | "isOverdue"
    >;
    status?: InstallmentItemStatus;
    className?: string;
}

/** Badge de status. Parcelamentos em andamento não exibem badge, como nas recorrências. */
export function InstallmentStatusBadge({
    item,
    status: explicitStatus,
    className,
}: InstallmentStatusBadgeProps) {
    const status = explicitStatus ?? (item ? getInstallmentStatus(item) : null);

    if (!status || status === "ACTIVE") {
        return null;
    }

    const theme = INSTALLMENT_STATUS_THEMES[status];

    return (
        <Badge variant="outline" className={cn(theme.badgeClassName, className)}>
            {theme.label}
        </Badge>
    );
}
