"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface CommitmentCycleSearchProps {
    value?: string;
    onChange: (value: string | undefined) => void;
    placeholder?: string;
    className?: string;
    children?: React.ReactNode;
}

export function CommitmentCycleSearch({
    value = "",
    onChange,
    placeholder = "Buscar compromisso ou fatura...",
    className,
    children,
}: CommitmentCycleSearchProps) {
    const [localValue, setLocalValue] = React.useState(value);
    const [prevPropValue, setPrevPropValue] = React.useState(value);

    // Sincroniza quando o valor externo muda (ex: "Limpar filtros") sem setState em useEffect
    if (value !== prevPropValue) {
        setPrevPropValue(value);
        setLocalValue(value);
    }

    const debouncedValue = useDebounce(localValue, 500);
    const onChangeRef = React.useRef(onChange);

    React.useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Propaga o valor debounced para a URL/filtro apenas quando difere da prop atual
    React.useEffect(() => {
        const normalizedDebounced = debouncedValue.trim() || undefined;
        const normalizedProp = value.trim() || undefined;

        if (normalizedDebounced !== normalizedProp) {
            onChangeRef.current(normalizedDebounced);
        }
    }, [debouncedValue, value]);

    const handleClear = () => {
        setLocalValue("");
        onChange(undefined);
    };

    return (
        <InputGroup className={cn("w-full bg-card", className)}>
            <InputGroupAddon align="inline-start">
                <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder={placeholder}
                className="text-sm"
            />
            {(localValue || children) && (
                <InputGroupAddon align="inline-end" className="gap-1">
                    {localValue && (
                        <InputGroupButton
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={handleClear}
                            aria-label="Limpar busca"
                        >
                            <X className="size-3.5" />
                        </InputGroupButton>
                    )}
                    {children}
                </InputGroupAddon>
            )}
        </InputGroup>
    );
}

export default CommitmentCycleSearch;