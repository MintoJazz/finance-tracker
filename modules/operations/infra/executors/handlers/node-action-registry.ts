import type { OperationNodeAction } from "../../../application/plan/types"
import type { NodeActionHandler } from "./node-action-handler.interface"

export class NodeActionRegistry {
  private readonly handlers = new Map<string, NodeActionHandler<any>>()

  constructor(handlers: NodeActionHandler<any>[] = []) {
    for (const handler of handlers) {
      this.register(handler)
    }
  }

  register(handler: NodeActionHandler<any>): void {
    this.handlers.set(handler.type, handler)
  }

  get<TType extends OperationNodeAction["type"]>(
    type: TType
  ): NodeActionHandler<TType> | undefined {
    return this.handlers.get(type) as NodeActionHandler<TType> | undefined
  }
}

