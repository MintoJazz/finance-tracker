import { Page, PageRequest } from "@/types/pagination.types";
import { BaseFilter } from "@/types/filters.types";
import { CardSummary } from "../../models/card.schema";
import { CardProfile } from "../../models/card-profile.schema";

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
    findCardProfileById(id: number, contextId: number): Promise<CardProfile | null>;
    sumAmountsByBalance(balanceIds: number[]): Promise<Map<number, number>>;
}
