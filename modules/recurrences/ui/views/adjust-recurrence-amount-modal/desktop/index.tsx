"use client";

import { AdjustFormDialog } from "@/modules/agreements/ui/components/adjust-form";
import type { AdjustRecurrenceAmountModalProps } from "../types";

export default function AdjustRecurrenceAmountModalViewDesktop(
    props: AdjustRecurrenceAmountModalProps
) {
    return <AdjustFormDialog {...props} />;
}
