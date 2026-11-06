export interface ReimbursementCalculationResult {
  readonly totalCents: number
  readonly reimbursedCents: number
  readonly userShareCents: number
}

/**
 * Calcula a divisão entre o montante total da operação, o valor a ser ressarcido
 * por terceiros e a participação efetiva do próprio usuário.
 */
export function calculateReimbursement(
  totalCents: number,
  reimbursedCents: number
): ReimbursementCalculationResult {
  const safeTotal = Math.max(0, totalCents)
  const safeReimbursed = Math.min(safeTotal, Math.max(0, reimbursedCents))
  const userShare = Math.max(0, safeTotal - safeReimbursed)

  return {
    totalCents: safeTotal,
    reimbursedCents: safeReimbursed,
    userShareCents: userShare,
  }
}

