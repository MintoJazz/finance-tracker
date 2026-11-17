"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Ano bissexto só como referência, para permitir 29/02. Nunca é exibido nem salvo. */
const REF_YEAR = 2024;

interface Props extends Omit<React.ComponentProps<typeof Button>, "onChange" | "value"> {
    day?: number | null;
    month?: number | null;
    placeholder?: string;
    onChange: (day: number, month: number) => void;
}

/** Seleciona apenas dia e mês (vencimento anual). */
export function RecurrenceDayMonthPicker({
    day,
    month,
    placeholder = "Dia e mês",
    onChange,
    className,
    ...props
}: Props) {
    const [open, setOpen] = React.useState(false);
    const selected =
        day && month ? new Date(REF_YEAR, month - 1, day, 12) : undefined;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        className={cn(
                            "h-9 w-full justify-between px-3 font-normal",
                            !selected && "text-muted-foreground",
                            className
                        )}
                        {...props}
                    />
                }
            >
                <span>
                    {selected
                        ? format(selected, "d 'de' MMMM", { locale: ptBR })
                        : placeholder}
                </span>
                <CalendarIcon className="size-4 text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    locale={ptBR}
                    selected={selected}
                    defaultMonth={selected ?? new Date(REF_YEAR, new Date().getMonth(), 1)}
                    startMonth={new Date(REF_YEAR, 0)}
                    endMonth={new Date(REF_YEAR, 11)}
                    onSelect={(date) => {
                        if (!date) return;
                        onChange(date.getDate(), date.getMonth() + 1);
                        setOpen(false);
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
