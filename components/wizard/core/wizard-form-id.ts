/**
 * Gera o ID do formulário do passo de maneira determinística para vinculação de `form={id}`.
 * Quando `instanceId` é fornecido, evita colisões de IDs entre múltiplas instâncias de `<Wizard />` na mesma página.
 */
export function wizardFormId(stepId: string, instanceId?: string): string {
  return instanceId ? `wizard-${instanceId}-${stepId}` : `wizard-${stepId}`
}
