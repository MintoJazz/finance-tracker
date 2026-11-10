import { z } from "zod"
import type { OperationStepCatalog } from "../application/steps/interpreter"
import {
  resolveSteps,
  validateIntentSelection,
} from "../application/steps/interpreter"
import type { StepDefinition } from "../application/steps/types"
import type {
  OperationIntentKey,
  OperationIntentSlices,
} from "./intents"
import {
  BaseOperationSliceSchema,
  type BaseOperationSlice,
} from "./operation-base.schema"
import {
  OperationNatureSchema,
  type OperationNature,
  type OperationSeed,
} from "./operation-seed.schema"

export type { OperationIntentKey, OperationIntentSlices } from "./intents"

export interface OperationDraft extends OperationIntentSlices {
  nature?: OperationNature
  intents?: OperationIntentKey[]
  base?: Partial<BaseOperationSlice>
}

function getValueByPath(obj: Record<string, any>, path: string): any {
  const parts = path.split(".")
  let cursor: any = obj
  for (const part of parts) {
    if (cursor == null || typeof cursor !== "object") return undefined
    cursor = cursor[part]
  }
  return cursor
}

function setValueByPath(target: Record<string, any>, path: string, value: any) {
  if (value === undefined) return
  const parts = path.split(".")
  let cursor = target
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    if (typeof cursor[key] !== "object" || cursor[key] === null) {
      cursor[key] = {}
    }
    cursor = cursor[key]
  }
  cursor[parts[parts.length - 1]] = value
}

/**
 * Remove declarativamente fatias de intenções inativas e campos de etapas removidas/inativas.
 * Baseia-se exclusivamente na lista de etapas ativas retornada por `resolveSteps`.
 */
export function pruneInactiveOperationSlices<TKey extends string>(
  draft: Partial<OperationDraft>,
  activeSteps: readonly StepDefinition<TKey>[],
  activeIntents: readonly TKey[]
): Partial<OperationDraft> {
  const result: Record<string, any> = {
    nature: draft.nature,
    intents: [...activeIntents],
    base: {},
  }

  for (const step of activeSteps) {
    for (const fieldPath of step.fields) {
      const value = getValueByPath(draft as Record<string, any>, fieldPath)
      setValueByPath(result, fieldPath, value)
    }
  }

  if (draft.base?.custodyType && result.base) {
    result.base.custodyType = draft.base.custodyType
  }

  // Garante que apenas fatias de intenções ativas permaneçam no objeto final
  const activeIntentSet = new Set<string>(activeIntents)
  for (const key of Object.keys(result)) {
    if (key === "nature" || key === "intents" || key === "base") continue
    if (!activeIntentSet.has(key)) {
      delete result[key]
    }
  }

  return result as Partial<OperationDraft>
}

/**
 * Constrói o schema composto da operação a partir do catálogo declarativo.
 */
export function createOperationInputSchema<TKey extends string>(
  catalog: OperationStepCatalog<TKey>,
  seed: OperationSeed = {}
) {
  const intentShape: Record<string, z.ZodTypeAny> = {}
  for (const key of Object.keys(catalog.intents) as TKey[]) {
    const def = catalog.intents[key]
    if (def) {
      intentShape[key] = def.schema.optional()
    }
  }

  return z
    .object({
      nature: OperationNatureSchema,
      intents: z.array(z.string()).default([]),
      base: BaseOperationSliceSchema,
      ...intentShape,
    })
    .superRefine((input, ctx) => {
      const selectedIntents = (input.intents ?? []) as TKey[]

      // 1. Valida conflitos (excludes), dependências (requires) e condições (offer.when)
      const selectionValidation = validateIntentSelection(
        selectedIntents,
        catalog,
        input as Partial<OperationDraft>
      )
      if (!selectionValidation.valid) {
        for (const err of selectionValidation.errors) {
          ctx.addIssue({
            code: "custom",
            path: ["intents"],
            message: err,
          })
        }
      }

      // 2. Cada intenção listada exige sua fatia correspondente
      const selectedSet = new Set<string>(selectedIntents)
      for (const intentKey of selectedIntents) {
        const intentDef = catalog.intents[intentKey]
        if (!intentDef) {
          ctx.addIssue({
            code: "custom",
            path: ["intents"],
            message: `Intenção desconhecida: "${intentKey}"`,
          })
          continue
        }

        const sliceValue = (input as Record<string, unknown>)[intentKey]
        if (sliceValue === undefined) {
          ctx.addIssue({
            code: "custom",
            path: [intentKey],
            message: `A fatia da intenção "${intentKey}" é obrigatória`,
          })
        }
      }

      // 3. Rejeita fatias órfãs (presentes no payload sem estarem em `intents`)
      for (const key of Object.keys(catalog.intents)) {
        if (
          !selectedSet.has(key) &&
          (input as Record<string, unknown>)[key] !== undefined
        ) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: `A fatia "${key}" não pode ser enviada sem estar listada em intents`,
          })
        }
      }

      // 4. Executa validações contextuais declaradas pelas etapas e intenções ativas
      const activeSteps = resolveSteps(
        {
          nature: input.nature,
          intents: selectedIntents,
          seed,
          data: input as Partial<OperationDraft>,
        },
        catalog
      )

      const draftInput = input as Partial<OperationDraft>

      for (const step of activeSteps) {
        const issues = step.validate?.(draftInput) ?? []
        for (const issue of issues) {
          ctx.addIssue({
            code: "custom",
            path: [...issue.path],
            message: issue.message,
          })
        }
      }

      for (const intentKey of selectedIntents) {
        const intentDef = catalog.intents[intentKey]
        const issues = intentDef?.validate?.(draftInput) ?? []
        for (const issue of issues) {
          ctx.addIssue({
            code: "custom",
            path: [...issue.path],
            message: issue.message,
          })
        }
      }
    })
}
