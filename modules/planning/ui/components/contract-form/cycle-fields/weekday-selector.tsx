"use client";

import * as React from "react";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export interface WeekdaySelectorProps {
  id?: string;
  value?: number | null;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const WEEKDAYS = [
  { value: 1, full: "Segunda-feira", short: "Seg" },
  { value: 2, full: "Terça-feira", short: "Ter" },
  { value: 3, full: "Quarta-feira", short: "Qua" },
  { value: 4, full: "Quinta-feira", short: "Qui" },
  { value: 5, full: "Sexta-feira", short: "Sex" },
  { value: 6, full: "Sábado", short: "Sáb" },
  { value: 7, full: "Domingo", short: "Dom" },
] as const;

const WEEKDAY_ITEMS: Record<string, string> = {
  "1": "Segunda-feira",
  "2": "Terça-feira",
  "3": "Quarta-feira",
  "4": "Quinta-feira",
  "5": "Sexta-feira",
  "6": "Sábado",
  "7": "Domingo",
};

const emptySubscribe = () => () => {};

export function WeekdaySelector({
  id,
  value,
  onChange,
  placeholder = "Selecione o dia da semana",
  disabled = false,
  className,
}: WeekdaySelectorProps) {
  const isDesktop = useIsDesktop();
  const isClient = React.useSyncExternalStore(emptySubscribe, () => true, () => false);

  const currentValue = typeof value === "number" && value >= 1 && value <= 7 ? value : 1;

  // Renderiza no desktop via Select Dropdown
  if (!isClient || isDesktop) {
    return (
      <Select
        value={String(currentValue)}
        items={WEEKDAY_ITEMS}
        onValueChange={(val) => {
          if (val) onChange(Number(val));
        }}
        disabled={disabled}
      >
        <SelectTrigger id={id} className={cn("w-full h-9", className)}>
          <SelectValue placeholder={placeholder}>
            {(val) => (val ? WEEKDAY_ITEMS[String(val)] ?? String(val) : placeholder)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {WEEKDAYS.map((day) => (
            <SelectItem key={day.value} value={String(day.value)}>
              {day.full}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Renderiza no mobile via ToggleGroup em scroll horizontal único
  // data-vaul-no-drag impede que o drawer móvel intercepte o arraste horizontal
  return (
    <div
      data-vaul-no-drag=""
      className={cn(
        "w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x py-0.5",
        className
      )}
    >
      <ToggleGroup
        value={[String(currentValue)]}
        onValueChange={(val) => {
          const item = Array.isArray(val) ? val[0] : val;
          if (item) onChange(Number(item));
        }}
        disabled={disabled}
        variant="outline"
        size="sm"
        className="flex flex-nowrap w-max min-w-full justify-between gap-1 p-0.5"
      >
        {WEEKDAYS.map((day) => (
          <ToggleGroupItem
            key={day.value}
            value={String(day.value)}
            className="flex-1 shrink-0 min-w-[40px] px-2 h-8.5 text-xs font-medium cursor-pointer"
            aria-label={day.full}
          >
            {day.short}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
