import { Page } from "@/types/pagination.types";
import { CardSummary } from "@/modules/account/core/schemas/card.schema";
import { CardActionContext } from "../../config/card-actions-menu";
import CardListItem from "./list-item";
import EmptyCardList from "./empty";
import { cn } from "cn";

interface Props {
    data: Page<CardSummary> | CardSummary[];
    actionContext: CardActionContext;
    className?: string;
}

export default function CardList({ data, actionContext, className }: Props) {
    const items = Array.isArray(data) ? data : data.data;

    if (items.length === 0) {
        return (
            <div className={cn("px-4", className)}>
                <EmptyCardList />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "w-full flex flex-col divide-y divide-border border-y border-border",
                className
            )}
        >
            {items.map((card) => (
                <CardListItem
                    key={card.id}
                    card={card}
                    context={actionContext}
                />
            ))}
        </div>
    );
}
