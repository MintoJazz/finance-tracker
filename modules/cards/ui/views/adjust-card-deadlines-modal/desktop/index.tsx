"use client";

import { AdjustFormDialog } from "@/modules/agreements/ui/components/adjust-form";
import type { AdjustCardDeadlinesModalProps } from "../types";

export default function AdjustCardDeadlinesModalViewDesktop(
    props: AdjustCardDeadlinesModalProps
) {
    return <AdjustFormDialog {...props} />;
}
