"use client";

import { AdjustFormDialog } from "@/modules/agreements/ui/components/adjust-form";
import type { AdjustRecurrenceDeadlinesModalProps } from "../types";

export default function AdjustRecurrenceDeadlinesModalViewDesktop(
    props: AdjustRecurrenceDeadlinesModalProps
) {
    return <AdjustFormDialog {...props} />;
}
