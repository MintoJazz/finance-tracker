import { ViewportConfig } from "./types"

export interface ViewRendererProps<TInput, TProps> extends ViewportConfig<TInput, TProps> {
    data: TInput
}

export default function ViewRenderer<TInput, TProps extends object>({ data, View, hook }: ViewRendererProps<TInput, TProps>) {
    const props = hook(data)

    return <View {...props} />
}

export { ViewRenderer }
