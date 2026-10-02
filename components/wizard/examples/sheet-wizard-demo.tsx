"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { WizardSheet } from "@/components/wizard"
import { onboardingSteps, type OnboardingData } from "./onboarding-wizard"

export function SheetWizardDemo() {
  const handleComplete = async (data: OnboardingData) => {
    console.log("[SheetWizardDemo] Finalizado com sucesso:", data)
    toast.add({
      type: "success",
      title: "Cadastro Concluído no Sheet!",
      description: `Parabéns ${data.fullName}, seus dados foram salvos com sucesso.`,
      priority: "high",
    })
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border rounded-xl bg-muted/20">
      <h2 className="text-base font-semibold mb-2">Abrir Wizard em Gaveta Lateral (Sheet)</h2>
      <p className="text-xs text-muted-foreground text-center max-w-md mb-4">
        Exemplo do mesmo Wizard com validação Zod e passos condicionais renderizado de forma responsiva dentro de um Sheet.
      </p>

      <WizardSheet<OnboardingData>
        title="Novo Cadastro de Usuário"
        description="Preencha as etapas para configurar sua conta e preferências"
        steps={onboardingSteps}
        onComplete={handleComplete}
        contentClassName="sm:max-w-lg md:max-w-xl"
        trigger={
          <Button variant="default">
            Abrir Wizard no Sheet
          </Button>
        }
      />
    </div>
  )
}
