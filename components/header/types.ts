export type ExtractParams<P extends string> =
  P extends `${string}[${infer Param}]${infer Rest}`
    ? Param | ExtractParams<Rest>
    : never

export type RouteParams<P extends string> =
  [ExtractParams<P>] extends [never]
    ? Record<string, never>
    : Record<ExtractParams<P>, string | number>

export interface RouteDefinition<TKey extends string = string> {
  pattern: string
  label: string | ((params: Record<string, string>) => string)
  parent?: TKey
}

export interface Crumb {
  key: string
  label: string
  href: string
  isCurrent: boolean
}
