"use client";

import { AdjustFormDialog } from "@/modules/agreements/ui/components/adjust-form";
import type { AdjustCardLimitModalProps } from "../types";

export default function AdjustCardLimitModalViewDesktop(props: AdjustCardLimitModalProps) {
    return <AdjustFormDialog {...props} />;
}
