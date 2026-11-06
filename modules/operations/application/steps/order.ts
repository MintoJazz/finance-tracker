/**
 * Faixas de ordenação das etapas do Wizard de Operações.
 * Regras:
 * - Inteiro de 4 dígitos (1000–9999)
 * - Espaçamento largo para permitir inserção de novas etapas sem renumerar
 */
export const STEP_ORDER = {
  /** 1000–1999: Ponto de partida (natureza) e etapas iniciais de intenções (ex.: escolher compromisso 1500) */
  ENTRY: 1000,
  INTENT_ENTRY: 1500,

  /** 2000–2999: Balance de Custódia (Wallet, Card, Reserve) e Fatura condicional do Cartão */
  CUSTODY: 2000,
  CUSTODY_CYCLE: 2100,

  /** 3000–3999: Dados financeiros principais (valor, vencimento, competência, descrição) */
  DETAILS: 3000,

  /** 4000–4999: Classificação (Categoria Raiz, Subcategoria e ciclos inline de criação 4010..4130) */
  CATEGORY: 4000,
  CREATE_CATEGORY_BASICS: 4010,
  CREATE_CATEGORY_COLOR: 4020,
  CREATE_CATEGORY_ICON: 4030,

  SUBCATEGORY: 4100,
  CREATE_SUBCATEGORY_BASICS: 4110,
  CREATE_SUBCATEGORY_COLOR: 4120,
  CREATE_SUBCATEGORY_ICON: 4130,

  /** 5000–5999: Etapas de intenções de 1º nível (parcelamento, reembolso...) */
  INTENT_PRIMARY: 5000,
  INTENT_REIMBURSEMENT: 5100,

  /** 6000–6999: Etapas de intenções encadeadas / 2º nível (ex.: rateio de grupo) */
  INTENT_SECONDARY: 6100,

  /** 9000–9999: Revisão final e confirmação */
  REVIEW: 9000,
} as const

export function isValidStepOrder(order: number): boolean {
  return Number.isInteger(order) && order >= 1000 && order <= 9999
}

