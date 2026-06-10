import { useMoneyInput } from "@/hooks/use-money-input";
import { formatarDinheiro } from "@/lib/formatters"; // assumindo que essa função aceita string ou number
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

// 1. Removemos o 'onChange' e 'value' nativos e injetamos os nossos
type MoneyInputProps = Omit<ComponentProps<"input">, "onChange" | "value"> & {
    value?: number;
    onChange?: (value: number) => void;
};

export function MoneyInput({ value, onChange, className, ...props }: MoneyInputProps) {
    const { obterCentavos } = useMoneyInput();

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        // 2. Extraímos o número puro de centavos
        const centavos = obterCentavos(e.target.value);
        
        // 3. Agora o TypeScript sabe perfeitamente que onChange recebe um number
        if (onChange) onChange(centavos);
    }

    return (
        <input
            {...props}
            type="text"
            onChange={handleChange}
            value={formatarDinheiro(value ?? 0)} // Garante um fallback caso value seja undefined
            className={cn("outline-none focus:ring-0", className)}
        />
    );
}