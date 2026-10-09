import { Page, PageRequest } from "@/types/pagination.types";
import { CycleEntryItem } from "../schemas/cycle-entries.schema";

export interface ListCycleEntriesParams {
    contextId: number;
    identifier: { agreementId?: number; balanceId?: number };
    from: Date;
    to: Date;
    pageRequest: PageRequest;
    q?: string;
}

export interface ICycleEntriesQueries {
    listCycleEntries(params: ListCycleEntriesParams): Promise<Page<CycleEntryItem>>;
}
