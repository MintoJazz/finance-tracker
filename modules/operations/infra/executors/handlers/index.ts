import { CreateCategoryBalanceHandler } from "./create-category-balance.handler"
import { CreateDirectEntryHandler } from "./create-direct-entry.handler"
import { SettleObligationHandler } from "./settle-obligation.handler"
import { NodeActionRegistry } from "./node-action-registry"

export * from "./node-action-handler.interface"
export * from "./node-action-registry"
export * from "./create-direct-entry.handler"
export * from "./create-category-balance.handler"
export * from "./settle-obligation.handler"

export function makeDefaultNodeActionRegistry(): NodeActionRegistry {
  return new NodeActionRegistry([
    new CreateDirectEntryHandler(),
    new CreateCategoryBalanceHandler(),
    new SettleObligationHandler(),
  ])
}

