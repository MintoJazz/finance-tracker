import React from "react";
import { Calendar, MoreHorizontal, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
    MovementEntry,
    MovementEntryScope,
} from "@/modules/movements/models/movement-entry.schema";
import {
    ListItem,
    ListItemHeader,
    ListItemAvatar,
    ListItemContent,
    ListItemTitle,
    ListItemActions,
    ListItemFooter,
    ListItemFooterLeft,
    ListItemFooterRight,
    ListItemFooterInfo,
} from "@/components/list-item";
import { MovementEntryAvatar } from "../movement-entry/movement-entry-avatar";
import { MovementEntrySubtitle } from "../movement-entry/movement-entry-subtitle";
import { MovementEntryAmount } from "../movement-entry/movement-entry-amount";
import { resolveMovementEntryTypeLabel } from "../movement-entry/presentation";
import { MOVEMENT_ENTRY_TYPE_THEMES } from "../../themes/movement-entry-type";

interface MovementEntryListItemProps {
    entry: MovementEntry;
    scope: MovementEntryScope;
    onOpenActions?: () => void;
    className?: string;
}

export function MovementEntryListItem({
    entry,
    scope,
    onOpenActions,
    className,
}: MovementEntryListItemProps) {
    const {
        description,
        date,
        type,
        isReversed,
        hasAttachment,
    } = entry;

    const typeTheme = MOVEMENT_ENTRY_TYPE_THEMES[type];
    const TypeIcon = typeTheme?.icon ?? Calendar;
    const typeLabel = resolveMovementEntryTypeLabel(entry, scope);
    const dateObj = typeof date === "string" ? new Date(date) : date;

    return (
        <ListItem className={cn(isReversed && "opacity-75", className)}>
            <ListItemHeader>
                <ListItemAvatar>
                    <MovementEntryAvatar entry={entry} scope={scope} size="md" />
                </ListItemAvatar>
                <ListItemContent>
                    <ListItemTitle>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                    className={cn(
                                        "truncate font-medium text-foreground text-sm",
                                        isReversed && "line-through text-muted-foreground"
                                    )}
                                    title={description}
                                >
                                    {description}
                                </span>
                                {hasAttachment && (
                                    <span title="Possui anexo/comprovante">
                                        <Paperclip className="size-3.5 text-muted-foreground shrink-0" />
                                    </span>
                                )}
                                {isReversed && (
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] text-muted-foreground border-dashed shrink-0"
                                    >
                                        Estornada
                                    </Badge>
                                )}
                            </div>
                            <MovementEntrySubtitle entry={entry} scope={scope} />
                        </div>
                    </ListItemTitle>
                </ListItemContent>
                {onOpenActions && (
                    <ListItemActions>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 p-0 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenActions();
                            }}
                            aria-label={`Ações do lançamento ${description}`}
                        >
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </ListItemActions>
                )}
            </ListItemHeader>

            <ListItemFooter>
                <ListItemFooterLeft>
                    <ListItemFooterInfo icon={Calendar}>
                        {formatDate(dateObj)}
                    </ListItemFooterInfo>
                    <ListItemFooterInfo icon={TypeIcon}>
                        {typeLabel}
                    </ListItemFooterInfo>
                </ListItemFooterLeft>
                <ListItemFooterRight>
                    <MovementEntryAmount entry={entry} scope={scope} />
                </ListItemFooterRight>
            </ListItemFooter>
        </ListItem>
    );
}

