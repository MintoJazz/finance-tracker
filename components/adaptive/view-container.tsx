"use client"

import { AdaptiveConfig } from "./types"
import { useIsDesktop } from "@/hooks/use-breakpoint"
import { useMounted } from "@/hooks/use-mounted"
import ViewRenderer from "./view-renderer"

export interface ViewContainerProps<TInput, TProps extends object = any> extends AdaptiveConfig<TInput, TProps> {
    data: TInput
}

export default function ViewContainer<TInput, TProps extends object = any>({ data, views }: ViewContainerProps<TInput, TProps>) {
    const isDesktop = useIsDesktop()
    const isMounted = useMounted()

    if (!isMounted) return null

    const viewport = isDesktop ? "desktop" : "mobile"
    const config = views[viewport]

    return <ViewRenderer key={viewport} data={data} {...config} />
}

export { ViewContainer }
