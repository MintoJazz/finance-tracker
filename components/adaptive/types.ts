export type ViewPort = "mobile" | "desktop"

export interface ViewportConfig<TInput, TProps> {
    hook: (input: TInput) => TProps
    View: React.ComponentType<TProps>
}

export interface AdaptiveConfig<TInput, TProps = any> {
    views: Record<ViewPort, ViewportConfig<TInput, TProps>>
}
