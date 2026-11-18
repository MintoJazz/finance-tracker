"use client";

import { AdjustFormDrawer } from "@/modules/agreements/ui/components/adjust-form";
import type { AdjustRecurrenceDeadlinesModalProps } from "../types";

export default function AdjustRecurrenceDeadlinesModalViewMobile(
    props: AdjustRecurrenceDeadlinesModalProps
) {
    return <AdjustFormDrawer {...props} />;
}
