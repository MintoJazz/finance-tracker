import { useFormContext, useController } from "react-hook-form"
import { Slot } from "@radix-ui/react-slot"
import { FieldError } from "./ui/field"

interface ControlledFieldProps {
    name: string
    className?: string
    children: React.ReactNode
}

export function ControlledField({ name, children, className }: ControlledFieldProps) {
    const { control } = useFormContext();
    const { field, fieldState } = useController({ name, control });

    return <div className={className}>
        <Slot {...field}>
            {children}
        </Slot>
        <FieldError errors={[fieldState.error]} />
    </div>
}