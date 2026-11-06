/**
 * Calcula a cota de cada participante de um grupo em centavos inteiros.
 * No modo EQUAL, divide igualmente alocando qualquer resto no primeiro membro.
 * No modo WEIGHTS, divide proporcionalmente aos pesos definidos, alocando o resto no primeiro membro.
 */
export function calculateGroupShares(
  groupCents: number,
  memberIds: readonly string[],
  mode: "EQUAL" | "WEIGHTS" = "EQUAL",
  weights?: Record<string, number>
): Record<string, number> {
  if (memberIds.length === 0 || groupCents <= 0) {
    return {}
  }

  if (memberIds.length === 1) {
    return { [memberIds[0]]: groupCents }
  }

  const result: Record<string, number> = {}

  if (mode === "EQUAL") {
    const baseShare = Math.floor(groupCents / memberIds.length)
    const remainder = groupCents - baseShare * memberIds.length

    memberIds.forEach((id, idx) => {
      result[id] = idx === 0 ? baseShare + remainder : baseShare
    })
    return result
  }

  // Modo WEIGHTS
  const resolvedWeights = memberIds.map((id) => Math.max(1, weights?.[id] ?? 1))
  const totalWeight = resolvedWeights.reduce((acc, w) => acc + w, 0)

  let allocatedSum = 0
  memberIds.forEach((id, idx) => {
    const weight = resolvedWeights[idx]
    const share = Math.floor((groupCents * weight) / totalWeight)
    result[id] = share
    allocatedSum += share
  })

  // Distribui resto de arredondamento no primeiro membro
  const remainder = groupCents - allocatedSum
  if (remainder !== 0) {
    result[memberIds[0]] += remainder
  }

  return result
}

