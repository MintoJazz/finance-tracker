import { CardSummary } from "@/modules/account/core/schemas/card.schema";
import { CARD_ACTIONS, CardActionContext } from "../../config/card-actions-menu";
import { CARD_COLUMNS } from "./columns";
import { DataTable } from "@/components/data-table";
import { Page } from "@/types/pagination.types";
import EmptyCardTable from "./empty";

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
        />
    );
}
