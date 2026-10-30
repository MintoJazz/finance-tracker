"use client"

import type { AdaptiveConfig, ViewPort } from "../../types/adaptive.types"
import { useIsDesktop } from "@/hooks/use-breakpoint"
import { useMounted } from "@/hooks/use-mounted"
import ViewRenderer from "./view-renderer"

export interface ViewContainerProps<TInput, TProps extends object = any>
    extends AdaptiveConfig<TInput, TProps> {
    data: TInput
    initialViewport?: ViewPort
}

export default function ViewContainer<TInput, TProps extends object = any>({
    data,
    views,
    initialViewport = "desktop",
}: ViewContainerProps<TInput, TProps>) {
    const isDesktop = useIsDesktop()
    const isMounted = useMounted()

    // No SSR e durante a hidratação inicial, usa initialViewport para garantir SSR idêntico sem hydration mismatch.
    // Após a montagem no browser, o media query de tela (useIsDesktop) assume o controle para responder a redimensionamento.
    const viewport: ViewPort = isMounted
        ? (isDesktop ? "desktop" : "mobile")
        : initialViewport

    const config = views[viewport]

    return <ViewRenderer key={viewport} data={data} {...config} />
}

export { ViewContainer }
