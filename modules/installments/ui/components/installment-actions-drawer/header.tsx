import {
    EntityHeader,
    EntityHeaderContent,
    EntityHeaderDescription,
    EntityHeaderMedia,
    EntityHeaderTitle,
} from "@/components/entity-header";
import { AmountSpan } from "@/components/amount-span";
import { isInstallmentPaid, type InstallmentListItem } from "@/modules/installments/models/schemas/installment-item.schema";
import {
    formatInstallmentNextDue,
    getInstallmentSourceLabel,
} from "@/modules/installments/ui/themes/installment.themes";
import { InstallmentAvatar } from "../installment-avatar";

interface InstallmentActionsDrawerHeaderProps {
    installment: InstallmentListItem;
}

export function InstallmentActionsDrawerHeader({
    installment,
}: InstallmentActionsDrawerHeaderProps) {
    const { description, installmentAmount } = installment;
    const paid = isInstallmentPaid(installment);

    return (
        <EntityHeader>
            <EntityHeaderMedia>
                <InstallmentAvatar item={installment} size="lg" />
            </EntityHeaderMedia>
            <EntityHeaderContent>
                <EntityHeaderTitle>{description}</EntityHeaderTitle>
                <EntityHeaderDescription className="flex items-center gap-1.5 mt-0.5">
                    <AmountSpan
                        amount={installmentAmount}
                        isNegative={!paid}
                        isCancelled={paid}
                    />
                    <span>•</span>
                    <span>
                        {getInstallmentSourceLabel(installment)} •{" "}
                        {formatInstallmentNextDue(installment)}
                    </span>
                </EntityHeaderDescription>
            </EntityHeaderContent>
        </EntityHeader>
    );
}
