"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface Props {
    value?: string;
    onChange: (value: string | undefined) => void;
    className?: string;
    autoDebounce?: boolean;
    children?: React.ReactNode;
}

export function WalletMovementSearch({ value, onChange, className, autoDebounce = true, children }: Props) {
    const [search, setSearch] = useState<string>(value ?? "");
    const [prevPropQ, setPrevPropQ] = useState(value);
    
    if (value !== prevPropQ) {
        setPrevPropQ(value);
        setSearch(value ?? "");
    }
    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        if (!autoDebounce) return;
        if (debouncedSearch !== (value ?? "")) {
            onChange(debouncedSearch || undefined);
        }
    }, [debouncedSearch, autoDebounce, value, onChange]);

    const handleChange = (val: string) => {
        setSearch(val);
        if (!autoDebounce) {
            onChange(val || undefined);
        }
    };

    return (
        <InputGroup className={cn("w-full", className)}>
            <InputGroupAddon>
                <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
                value={search}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Ex: Salário, Mercado..."
            />
            {(search || children) && (
                <InputGroupAddon align="inline-end" className="gap-1.5">
                    {search && (
                        <button
                            type="button"
                            onClick={() => handleChange("")}
                            className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-sm transition-colors"
                            aria-label="Limpar busca"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                    {children}
                </InputGroupAddon>
            )}
        </InputGroup>
    );
}
