"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface AnnualDateSelectorProps {
  id?: string;
  day?: number | null;
  month?: number | null;
  onChange: (day: number, month: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function AnnualDateSelector({
  id,
  day,
  month,
  onChange,
  placeholder = "Selecione o dia e mês",
  disabled = false,
  className,
}: AnnualDateSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const referenceYear = new Date().getFullYear();

  const selectedDate = React.useMemo(() => {
    if (day && month && day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return new Date(referenceYear, month - 1, day);
    }
    return undefined;
  }, [day, month, referenceYear]);

  const [navMonth, setNavMonth] = React.useState<Date | undefined>(undefined);
  const currentMonth = navMonth ?? selectedDate ?? new Date(referenceYear, (month ?? 1) - 1, 1);

  const displayLabel = React.useMemo(() => {
    if (!selectedDate) return placeholder;
    return format(selectedDate, "d 'de' MMMM", { locale: ptBR });
  }, [selectedDate, placeholder]);

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    onChange(date.getDate(), date.getMonth() + 1);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full h-9 justify-between font-normal px-3 text-sm",
              !selectedDate && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <span className="truncate">{displayLabel}</span>
        <CalendarIcon className="size-4 shrink-0 text-muted-foreground ml-2" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-0 z-50 bg-popover"
      >
        <div className="p-2 border-b border-border/60 bg-muted/30">
          <p className="text-xs font-medium text-foreground">
            {selectedDate
              ? `Vencimento anual: ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`
              : "Escolha o mês e o dia de vencimento"}
          </p>
        </div>
        <Calendar
          mode="single"
          selected={selectedDate}
          month={currentMonth}
          onMonthChange={setNavMonth}
          onSelect={handleSelect}
          locale={ptBR}
          className="p-2"
        />
      </PopoverContent>
    </Popover>
  );
}
