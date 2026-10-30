"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

export interface CategoriesMasterFilterProps {
  dateRange: DateRange;
  onChangeDateRange?: (range: DateRange | undefined) => void;
  isMobile?: boolean;
  className?: string;
}

export function CategoriesMasterFilter({
  dateRange,
  onChangeDateRange,
  isMobile = false,
  className,
}: CategoriesMasterFilterProps) {
  const [open, setOpen] = React.useState(false);

  const formattedLabel = React.useMemo(() => {
    if (!dateRange.from) return "Selecionar período";
    const fromStr = format(dateRange.from, "dd/MM", { locale: ptBR });
    if (!dateRange.to) return fromStr;
    const toStr = format(dateRange.to, "dd/MM", { locale: ptBR });
    return `${fromStr} – ${toStr}`;
  }, [dateRange]);

  const triggerButton = (
    <Button
      type="button"
      variant="outline"
      onClick={isMobile ? () => setOpen(true) : undefined}
      className={cn(
        "w-full justify-start text-xs font-normal h-8 px-2.5 gap-2 bg-background/50 hover:bg-muted/50 border-border/60",
        className
      )}
    >
      <CalendarIcon className="size-3.5 text-muted-foreground shrink-0" />
      <span className="truncate tabular-nums font-mono text-muted-foreground">
        {formattedLabel}
      </span>
    </Button>
  );

  if (isMobile) {
    return (
      <>
        {triggerButton}
        <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
          <DrawerContent className="p-4 flex flex-col items-center">
            <DrawerHeader className="w-full text-center">
              <DrawerTitle>Selecionar Período</DrawerTitle>
              <DrawerDescription>
                Filtre os totais das categorias por intervalo de datas.
              </DrawerDescription>
            </DrawerHeader>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                onChangeDateRange?.(range);
                if (range?.from && range?.to) {
                  setOpen(false);
                }
              }}
              numberOfMonths={1}
              locale={ptBR}
            />
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={triggerButton} />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={(range) => {
            onChangeDateRange?.(range);
            if (range?.from && range?.to) {
              setOpen(false);
            }
          }}
          numberOfMonths={1}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
}

export default CategoriesMasterFilter;
