/**
 * Divide o valor total em centavos pelo número de parcelas,
 * distribuindo o resto da divisão inteira na primeira parcela
 * para que a soma de todas as parcelas seja estritamente igual a `totalCents`.
 */
export function calculateInstallments(
  totalCents: number,
  count: number
): readonly number[] {
  if (count <= 1 || totalCents <= 0) {
    return [totalCents]
  }

  const baseCents = Math.floor(totalCents / count)
  const remainder = totalCents - baseCents * count

  const installments: number[] = []
  for (let i = 0; i < count; i++) {
    // Aloca o resto (centavos excedentes) na primeira parcela
    installments.push(i === 0 ? baseCents + remainder : baseCents)
  }

  return installments
}

