/**
 * Gera o ID do formulário do passo de maneira determinística para vinculação de `form={id}`.
 */
export function wizardFormId(stepId: string): string {
  return `wizard-${stepId}`
}
