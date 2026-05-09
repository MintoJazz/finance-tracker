import { useFormContext, useController } from "react-hook-form"
import { Slot } from "@radix-ui/react-slot"
import { FieldLayout } from "./layout"

interface ControlledFieldProps {
    name: string;
    label: string;
    children: React.ReactNode;
}

export function ControlledField({ name, label, children }: ControlledFieldProps) {
    const { control } = useFormContext();
    const { field, fieldState } = useController({ name, control });

    return (
        <FieldLayout label={label} error={fieldState.error?.message}>
            <Slot {...field}>
                {children}
            </Slot>
        </FieldLayout>
    )
}