/**
 * Faixas de ordenação das etapas do Wizard de Operações.
 * Regras:
 * - Inteiro de 4 dígitos (1000–9999)
 * - Espaçamento largo para permitir inserção de novas etapas sem renumerar
 */
export const STEP_ORDER = {
  /** 1000–1999: Ponto de partida (natureza) */
  ENTRY: 1000,

  /** 2000–2999: Identificação e temporalidade (descrição e data) e compromissos */
  DETAILS: 2000,

  /** 3000–3999: Meio de Pagamento (Custódia) */
  CUSTODY: 3000,
  CHOOSE_CARD_INVOICE: 3100,

  /** 4000–4999: Valor financeiro da operação */
  AMOUNT: 4000,

  /** 5000–5999: Classificação (Categoria Raiz, Subcategoria e ciclos inline de criação 5010..5130) */
  CATEGORY: 5000,
  CREATE_CATEGORY_BASICS: 5010,
  CREATE_CATEGORY_COLOR: 5020,
  CREATE_CATEGORY_ICON: 5030,

  SUBCATEGORY: 5100,
  CREATE_SUBCATEGORY_BASICS: 5110,
  CREATE_SUBCATEGORY_COLOR: 5120,
  CREATE_SUBCATEGORY_ICON: 5130,

  /** 9000–9999: Revisão final e confirmação */
  REVIEW: 9000,
} as const

export function isValidStepOrder(order: number): boolean {
  return Number.isInteger(order) && order >= 1000 && order <= 9999
}
