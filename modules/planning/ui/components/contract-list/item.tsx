import { ContractSummaryItem } from "../../../core/schemas/contract.schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AmountSpan } from "@/components/amount-span";
import { format } from "date-fns";
import { MoreHorizontal, CalendarClock, ArrowDownRight, ArrowUpRight, CheckCircle2, CircleDashed, PlayCircle, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    ListItem,
    ListItemHeader,
    ListItemAvatar,
    ListItemContent,
    ListItemTitle,
    ListItemSubtitle,
    ListItemActions,
    ListItemFooter,
    ListItemFooterLeft,
    ListItemFooterRight,
    ListItemFooterInfo
} from "@/components/list-item";

interface Props {
  contract: ContractSummaryItem;
  onOpenActions: () => void;
  onSelect?: () => void;
  onToggleProjection: (id: number, checked: boolean) => void;
  className?: string;
}

export function ContractListItem({
  contract,
  onOpenActions,
  onSelect,
  onToggleProjection,
  className,
}: Props) {
  const { id, name, isArchived, type, value, frequency, dueDay, startsAt, endsAt, includeInProjection } = contract;
  const isPayable = type === "PAYABLE";

  const getFrequencyText = (freq: string, day: number) => {
    const freqMap: Record<string, string> = {
      WEEKLY: "Semanal",
      MONTHLY: "Mensal",
      YEARLY: "Anual",
    };
    return `${freqMap[freq] || freq} • Dia ${day}`;
  };

  const getDurationText = (start: Date, end: Date | null) => {
    const startStr = format(start, "dd/MM/yyyy");
    if (end) {
      return `${startStr} até ${format(end, "dd/MM/yyyy")}`;
    }
    return `Desde ${startStr}`;
  };

  return (
    <ListItem onSelect={onSelect} className={cn(isArchived && "opacity-75", className)}>
      <ListItemHeader>
        <ListItemAvatar>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 shrink-0 rounded-full",
              includeInProjection ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleProjection(id, !includeInProjection);
            }}
          >
            {includeInProjection ? <PlayCircle className="h-5 w-5" /> : <PauseCircle className="h-5 w-5" />}
          </Button>
        </ListItemAvatar>
        
        <ListItemContent>
          <ListItemTitle>
            <span
              className={cn(
                "truncate font-medium text-foreground text-sm",
                isArchived && "text-muted-foreground"
              )}
            >
              {name}
            </span>
            {isArchived && (
              <Badge variant="outline" className="text-muted-foreground">
                Arquivado
              </Badge>
            )}
          </ListItemTitle>
          <ListItemSubtitle className="mt-1">
            {getDurationText(startsAt, endsAt)}
          </ListItemSubtitle>
        </ListItemContent>

        <ListItemActions>
          <Button
            type="button"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onOpenActions();
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </ListItemActions>
      </ListItemHeader>

      <ListItemFooter>
        <ListItemFooterLeft>
          <ListItemFooterInfo icon={CalendarClock} className={cn(isArchived && "text-muted-foreground")}>
            {getFrequencyText(frequency, dueDay)}
          </ListItemFooterInfo>
          <ListItemFooterInfo icon={isPayable ? ArrowDownRight : ArrowUpRight} className={cn(isPayable ? "text-rose-500" : "text-emerald-500", isArchived && "text-muted-foreground opacity-70")}>
            {isPayable ? "Saída" : "Entrada"}
          </ListItemFooterInfo>
        </ListItemFooterLeft>
        
        <ListItemFooterRight>
          <span
            className={cn(
              "font-medium font-mono tabular-nums text-foreground truncate",
              isArchived && "text-muted-foreground"
            )}
          >
            <AmountSpan amount={value} isNegative={isPayable && !isArchived} isPositive={!isPayable && !isArchived} isCancelled={isArchived} />
          </span>
        </ListItemFooterRight>
      </ListItemFooter>
    </ListItem>
  );
}
