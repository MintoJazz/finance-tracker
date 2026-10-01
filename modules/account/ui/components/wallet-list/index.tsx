import { Page } from "@/types/pagination.types";
import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import { WalletActionContext } from "../../config/wallet-actions-menu";
import WalletListItem from "./list-item";
import EmptyWalletList from "./empty";
import { cn } from "cn";

interface Props {
    data: Page<WalletSummary> | WalletSummary[];
    actionContext: WalletActionContext;
    className?: string;
}

export default function WalletList({ data, actionContext, className }: Props) {
    const items = Array.isArray(data) ? data : data.data;

    if (items.length === 0) return <EmptyWalletList className={cn("mx-4", className)} />;

    return (
        <div
            className={cn(
                "w-full flex flex-col divide-y divide-border border-y border-border",
                className
            )}
        >
            {items.map((wallet) => (
                <WalletListItem
                    key={wallet.id}
                    wallet={wallet}
                    context={actionContext}
                />
            ))}
        </div>
    );
}