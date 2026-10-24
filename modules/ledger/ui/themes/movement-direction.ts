import { MovementDirectionEnum } from "../../core/schemas/movement.schema";

interface MovementDirectionThemeConfig {
    label: string
}

export const MOVEMENT_DIRECTION_THEMES: Record<MovementDirectionEnum|'ALL', MovementDirectionThemeConfig> = {
    ALL: { label: 'Todas' },
    CREDIT: { label: 'Entradas' },
    DEBIT: { label: 'Saídas' }
}