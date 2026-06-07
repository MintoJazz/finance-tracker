'use client'

import { useFormContext } from "react-hook-form";
import { TransactionFormType } from "../schema/types";
import { Field, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SchemaBadgeType } from "../schema/schema-registry";
import { BADGE_FIELDS } from "./badge-field-registry";
import { BADGE_THEMES } from "../../themes/badge-themes";

interface Props {
    availableBadges: SchemaBadgeType[]
}

export default function TransactionBadgeList({ availableBadges }: Props) {
    const { watch, setValue } = useFormContext<TransactionFormType>();

    const activeBadges = watch("activeBadges")
    const onValueChange = (newValues: SchemaBadgeType[]) => setValue("activeBadges", newValues as SchemaBadgeType[], {
        shouldValidate: true,
        shouldDirty: true
    });

    return <div className="flex flex-col gap-4">
        <Field>
            <FieldLabel>Ações</FieldLabel>
            <ToggleGroup type="multiple" variant="outline" size="sm" value={activeBadges} onValueChange={onValueChange} >
                {availableBadges.map((b) => <ToggleGroupItem value={b} key={b} >
                    {BADGE_THEMES[b]}
                </ToggleGroupItem>)}
            </ToggleGroup>
        </Field>
        {activeBadges.map((b) => {
            const BadgeField = BADGE_FIELDS[b]
            return <BadgeField key={b} />
        })}
    </div>
}
