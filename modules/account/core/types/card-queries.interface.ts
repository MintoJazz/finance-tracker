import { Page, PageRequest } from "@/types/pagination.types";
import { BaseFilter } from "@/types/filters.types";
import { CardSummary } from "../schemas/card.schema";

export interface CardEditData {
    id: number;
    name: string;
    limit: number;
    closingDay: number;
    dueDay: number;
}

export interface ICardQueries {
    listCardsByContextId(
        contextId: number,
        pageRequest: PageRequest,
        filter?: BaseFilter
    ): Promise<Page<CardSummary>>;
    findCardById(id: number, contextId: number): Promise<CardEditData | null>;
}