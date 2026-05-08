export type WithId = {
    id: number
}

export type Action = "add" | "edit" | "remove"

export type PendingChange<T extends WithId> = {
    action: Action,
    domain?: T | Partial<T>,
    original?: T
}

export type Drafts<T extends WithId> = Record<number, PendingChange<T>>