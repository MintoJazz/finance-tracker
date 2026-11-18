"use client";

import { AdjustFormDrawer } from "@/modules/agreements/ui/components/adjust-form";
import type { AdjustCardLimitModalProps } from "../types";

export default function AdjustCardLimitModalViewMobile(props: AdjustCardLimitModalProps) {
    return <AdjustFormDrawer {...props} />;
}
