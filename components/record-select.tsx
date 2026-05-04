"use client"

import { OptionsConfig } from "@/lib/types";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface RecordSelectProps {
    value: string
    onChange: (value: string) => void
    options: Record<string, OptionsConfig>
    // Agora children é opcional
    children?: ReactNode | ((currentValue: string) => ReactNode)
    // Novo prop para texto padrão
    placeholder?: string
    keys?: string[]
    renderItem?: (key: string, isSelected: boolean) => ReactNode
    className?: string // Útil para ajustar largura do botão padrão
}

export default function RecordSelect({
    value,
    onChange,
    children,
    options,
    keys,
    renderItem,
    placeholder = "Selecione...",
    className
}: RecordSelectProps) {
    
    const entries = Object.entries(options).filter(([key]) => {
        return keys ? keys.includes(key) : true;
    });

    // Lógica para determinar o Label do botão padrão
    const selectedOption = options[value];
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {/* Lógica de renderização do gatilho */}
                {children ? (
                    typeof children === "function" ? children(value) : children
                ) : (
                    <Button 
                        variant="outline" 
                        role="combobox"
                        className={cn("w-full justify-between font-normal", className)}
                    >
                        {displayLabel}
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                    </Button>
                )}
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="start" className="min-w-[200px]">
                <DropdownMenuGroup>
                    {entries.map(([key, config]) => {
                        const isSelected = value === key;

                        return (
                            <DropdownMenuItem
                                key={key}
                                onSelect={() => onChange(key)}
                            >
                                {renderItem ? (
                                    renderItem(key, isSelected)
                                ) : (
                                    keys ? (
                                        <>
                                            <Check className={cn(
                                                "mr-2 h-4 w-4",
                                                isSelected ? "opacity-100" : "opacity-0"
                                            )} />
                                            {config.label}
                                        </>
                                    ) : (
                                        <div className="flex justify-between w-full items-center">
                                            <span>{config.label}</span>
                                            <Check className={cn(
                                                "h-4 w-4 ml-2",
                                                isSelected ? "opacity-100" : "opacity-0"
                                            )} />
                                        </div>
                                    )
                                )}
                            </DropdownMenuItem>
                        )
                    })}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}