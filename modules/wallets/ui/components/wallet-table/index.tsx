import { WalletSummary } from "@/modules/wallets/models/wallet.schema";
import { WALLET_COLUMNS } from "./columns";
import { DataTable } from "@/components/data-table";
import { Page } from "@/types/pagination.types";
import EmptyWalletTable from "./empty";
import { WalletActionContext, WALLET_ACTIONS } from "../wallet-actions-drawer";

interface Props {
    data: Page<WalletSummary>;
    actionContext: WalletActionContext;
    setPage?: (val: number) => void;
    setPageSize?: (val: number) => void;
}

export default function WalletTable({ data, actionContext, setPage, setPageSize }: Props) {
    if (data.data.length === 0) return <EmptyWalletTable />;

    return (
        <DataTable
            {...data}
            columns={WALLET_COLUMNS}
            rowActions={WALLET_ACTIONS}
            actionContext={actionContext}
            showHeader={false}
            manualPagination
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onRowClick={actionContext.onView ? (row) => actionContext.onView?.(row.original) : undefined}
        />
    );
}