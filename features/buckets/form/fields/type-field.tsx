import { Field } from "@/components/ui/field";
import { BucketFormType } from "../schema/bucket-schema";
import { useFormContext } from "react-hook-form";
import { BucketType } from "@/generated/prisma/enums";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BUCKET_CARD_THEMES, BUCKET_TYPE_THEMES } from "../../themes/bucket-type";

export default function BucketTypeField() {
    const { watch, setValue } = useFormContext<BucketFormType>();
    const type = watch("type")

    const onValueChange = (newValue: BucketType) => setValue("type", newValue)

    return <Field>
        <ToggleGroup type="single" spacing={2} variant="outline" value={type} onValueChange={onValueChange}>
            {Object.entries(BucketType).map(([key, val]) => {
                const Icon = BUCKET_TYPE_THEMES[val]

                return <ToggleGroupItem size="lg" value={val} key={key} className="flex-1 flex size-16 flex-col items-center justify-center rounded-xl">
                    <Icon size={30}/>
                    {BUCKET_CARD_THEMES[val].label}
                </ToggleGroupItem>
            })}
        </ToggleGroup>
    </Field>
}