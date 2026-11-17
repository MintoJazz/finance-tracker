"use client";

import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useWizard } from "@/components/wizard";
import type { RecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import type { ClassificationPatch } from "@/modules/recurrences/ui/utils/recurrence-classification.utils";

/**
 * Aplica um patch de classificação no form do passo atual e no Wizard ao mesmo tempo,
 * para que os passos condicionais (nova categoria/subcategoria) apareçam na hora.
 */
export function useClassificationPatch() {
    const { setValue, getValues, formState } = useFormContext<RecurrenceFormValues>();
    const { update } = useWizard<RecurrenceFormValues>();

    const apply = useCallback(
        (patch: Partial<ClassificationPatch>) => {
            (Object.keys(patch) as (keyof ClassificationPatch)[]).forEach((key) => {
                setValue(key, patch[key] as never, {
                    shouldDirty: true,
                    shouldValidate: formState.isSubmitted,
                });
            });
            update(patch);
        },
        [setValue, update, formState.isSubmitted]
    );

    const current = useCallback(
        (): Partial<ClassificationPatch> => ({
            categoryId: getValues("categoryId"),
            newCategory: getValues("newCategory"),
            subcategoryId: getValues("subcategoryId"),
            newSubcategory: getValues("newSubcategory"),
        }),
        [getValues]
    );

    return { apply, current };
}
