import { CardSummary } from "@/modules/account/core/schemas/card.schema";
import { CARD_COLUMNS } from "./columns";
import { DataTable } from "@/components/data-table";
import { Page } from "@/types/pagination.types";
import EmptyCardTable from "./empty";
import { CardActionContext, CARD_ACTIONS } from "../card-actions-drawer";

interface Props {
    data: Page<CardSummary>;
    actionContext: CardActionContext;
    setPage?: (val: number) => void;
    setPageSize?: (val: number) => void;
}

export default function CardTable({ data, actionContext, setPage, setPageSize }: Props) {
    if (data.data.length === 0) return <EmptyCardTable />;

    return (
        <DataTable
            {...data}
            columns={CARD_COLUMNS}
            rowActions={CARD_ACTIONS}
            actionContext={actionContext}
            showHeader={false}
            manualPagination
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onRowClick={actionContext.onView ? (row) => actionContext.onView?.(row.original) : undefined}
        />
    );
}
