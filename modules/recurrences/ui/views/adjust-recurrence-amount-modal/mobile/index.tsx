"use client";

import { AdjustFormDrawer } from "@/modules/agreements/ui/components/adjust-form";
import type { AdjustRecurrenceAmountModalProps } from "../types";

export default function AdjustRecurrenceAmountModalViewMobile(
    props: AdjustRecurrenceAmountModalProps
) {
    return <AdjustFormDrawer {...props} />;
}
