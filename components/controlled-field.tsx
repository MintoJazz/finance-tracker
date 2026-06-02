import { useFormContext, useController } from "react-hook-form"
import { Slot } from "@radix-ui/react-slot"
import { FieldError } from "./ui/field"
import { cn } from "@/lib/utils"

interface ControlledFieldProps {
    name: string
    className?: string
    children: React.ReactNode
}

export function ControlledField({ name, children, className }: ControlledFieldProps) {
    const { control } = useFormContext();
    const { field, fieldState } = useController({ name, control });

    return <div className={cn("flex flex-col gap-1" ,className)}>
        <Slot {...field}>
            {children}
        </Slot>
        <FieldError className="text-center" errors={[fieldState.error]} />
    </div>
}