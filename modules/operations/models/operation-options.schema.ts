import { z } from "zod"
import { CustodyBalanceTypeSchema } from "./operation-seed.schema"

/**
 * 1. Opção de Meio de Pagamento (Carteira, Cartão de Crédito ou Reserva)
 */
export const CustodyOptionSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  type: CustodyBalanceTypeSchema,
  subtitle: z.string(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  balanceCents: z.number().int().optional(),
})
export type CustodyOption = z.infer<typeof CustodyOptionSchema>

/**
 * 2. Opção de Fatura (Ciclo de Cartão de Crédito)
 */
export const CreditCycleStatusSchema = z.enum(["OPEN", "FUTURE", "CLOSED"])
export type CreditCycleStatus = z.infer<typeof CreditCycleStatusSchema>

export const CreditCycleOptionSchema = z.object({
  cardBalanceId: z.number().int().positive(),
  title: z.string().min(1),
  subtitle: z.string(),
  closingDate: z.string(),
  dueDate: z.string(),
  status: CreditCycleStatusSchema,
})
export type CreditCycleOption = z.infer<typeof CreditCycleOptionSchema>

/**
 * 3. Opção de Categoria (Conta Sintética / Raiz)
 */
export const CategoryOptionSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
})
export type CategoryOption = z.infer<typeof CategoryOptionSchema>

/**
 * 4. Opção de Subcategoria (Conta Analítica / Contraparte da Operação)
 */
export const SubcategoryOptionSchema = z.object({
  id: z.number().int().positive(),
  parentId: z.number().int().positive(),
  parentName: z.string().min(1),
  name: z.string().min(1),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
})
export type SubcategoryOption = z.infer<typeof SubcategoryOptionSchema>

/**
 * Agregado com as opções completas fornecidas ao Wizard de Operações
 */
export const OperationOptionsSchema = z.object({
  custodies: z.array(CustodyOptionSchema),
  creditCycles: z.array(CreditCycleOptionSchema),
  categories: z.array(CategoryOptionSchema),
  subcategories: z.array(SubcategoryOptionSchema),
})
export type OperationOptions = z.infer<typeof OperationOptionsSchema>

