'use client'

import { BADGE_REGISTRY as BADGE_LABELS } from "./badge-labels";
import { useController, useFormContext } from "react-hook-form";
import { TransactionFormType } from "./schemas/types";
import { Field, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function TransactionBadgeList() {
    const { control } = useFormContext<TransactionFormType>()

    const { field, } = useController({
        name: "activeBadges",
        control,
    })

    return <Field>
        <FieldLabel>Ações</FieldLabel>
        <ToggleGroup type="multiple" variant="outline" size="sm" value={field.value} onValueChange={field.onChange} >
            {Object.entries(BADGE_LABELS).map(([key, val]) => <ToggleGroupItem value={key} key={key} >
                {val}
            </ToggleGroupItem>)}
        </ToggleGroup>
    </Field>
}