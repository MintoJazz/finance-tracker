import type { OperationSeed } from "../models/operation-seed.schema"

/**
 * Gera a URL tipada para iniciar uma operação com seed opcional na query string.
 */
export function operationHref(
  seed?: OperationSeed,
  basePath = "/operations/new"
): string {
  if (!seed) return basePath

  const params = new URLSearchParams()

  if (seed.nature) params.set("nature", seed.nature)
  if (seed.intents && seed.intents.length > 0) {
    params.set("intents", seed.intents.join(","))
  }
  if (seed.custodyBalanceId) {
    params.set("custodyBalanceId", String(seed.custodyBalanceId))
  }
  if (seed.custodyType) {
    params.set("custodyType", seed.custodyType)
  }
  if (seed.categoryId) {
    params.set("categoryId", String(seed.categoryId))
  }
  if (seed.subcategoryId) {
    params.set("subcategoryId", String(seed.subcategoryId))
  }
  if (seed.amount) {
    params.set("amount", String(seed.amount))
  }
  if (seed.description) {
    params.set("description", seed.description)
  }
  if (seed.dueDate) {
    params.set("dueDate", seed.dueDate)
  }
  if (seed.competanceDate) {
    params.set("competanceDate", seed.competanceDate)
  }

  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

