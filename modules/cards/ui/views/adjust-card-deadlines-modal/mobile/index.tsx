"use client";

import { AdjustFormDrawer } from "@/modules/agreements/ui/components/adjust-form";
import type { AdjustCardDeadlinesModalProps } from "../types";

export default function AdjustCardDeadlinesModalViewMobile(
    props: AdjustCardDeadlinesModalProps
) {
    return <AdjustFormDrawer {...props} />;
}
