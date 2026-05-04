import { useMoneyInput } from "@/hooks/use-money-input";
import { formatarDinheiro } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function MoneyInput({ value, onChange, className, ...props }: ComponentProps<"input">) {
    const { obterCentavos } = useMoneyInput()

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = obterCentavos(e.target.value);
        if (onChange) onChange(newValue)
    }

    return <input
        {...props}
        type="text"
        onChange={handleChange}
        value={formatarDinheiro(value)}
        className={cn("outline-none focus:ring-0", className)}
    />
}