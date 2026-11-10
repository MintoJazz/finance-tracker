"use client"

import * as React from "react"
import {
  CheckCircle2,
  Monitor,
  Play,
  RotateCcw,
  Smartphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import type { ViewPort } from "@/types/adaptive.types"
import type { OperationDraft } from "../../models/operation-input.schema"
import {
  OperationWizardContent,
  OperationWizardProvider,
  useOperationWizard,
} from "../components/operation-wizard"
import OperationWizardModalViewDesktop from "../views/operation-wizard-modal/desktop"
import OperationWizardModalViewMobile from "../views/operation-wizard-modal/mobile"
import { OperationInspectorPanel } from "./inspector-panel"
import { MOCK_OPERATION_OPTIONS } from "@/modules/operations/infra/mock/operation-options.mock"
import type { OperationSeed } from "@/modules/operations/models/operation-seed.schema"

export interface PlaygroundSeedPreset {
  id: string
  label: string
  description: string
  seed: OperationSeed
}

export const PLAYGROUND_SEED_PRESETS: readonly PlaygroundSeedPreset[] = [
  {
    id: "empty",
    label: "1. Sem Seed (Fluxo Completo)",
    description: "Começa no passo 1000 (Natureza).",
    seed: {},
  },
  {
    id: "pay-wallet",
    label: "2. Seed Pagar + Carteira Itaú",
    description:
      "Pula o passo 1000 (skipWhen por seed.nature) e pré-seleciona a Carteira Itaú.",
    seed: {
      nature: "PAY",
      custodyBalanceId: 1,
      custodyType: "WALLET",
    },
  },
  {
    id: "pay-card",
    label: "3. Seed Pagar + Cartão Nubank",
    description:
      "Pula 1000, pré-seleciona o Cartão Nubank e ativa declarativamente o passo 2100 (Fatura).",
    seed: {
      nature: "PAY",
      custodyBalanceId: 2,
      custodyType: "CREDIT",
      competanceDate: "2026-11-10",
    },
  },
  {
    id: "create-category",
    label: "4. Seed Criar Categoria",
    description:
      "Ativa CREATE_CATEGORY (que automaticamente implica CREATE_SUBCATEGORY).",
    seed: {
      nature: "PAY",
      intents: ["CREATE_CATEGORY"],
    },
  },
]

function PlaygroundWorkspace() {
  const { resetWithSeed, seed } = useOperationWizard()
  const [previewViewport, setPreviewViewport] =
    React.useState<ViewPort>("mobile")
  const [activePresetId, setActivePresetId] = React.useState<string>("empty")
  const [isDesktopDialogOpen, setIsDesktopDialogOpen] = React.useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false)
  const [lastSubmittedPayload, setLastSubmittedPayload] =
    React.useState<Partial<OperationDraft> | null>(null)

  const handleApplyPreset = (preset: PlaygroundSeedPreset) => {
    setActivePresetId(preset.id)
    setLastSubmittedPayload(null)
    resetWithSeed(preset.seed)
  }

  const handleComplete = (payload: Partial<OperationDraft>) => {
    setLastSubmittedPayload(payload)
    setIsDesktopDialogOpen(false)
    setIsMobileDrawerOpen(false)
    toast.add({
      type: "success",
      title: "Operação concluída no Playground!",
      description: `Natureza: ${payload.nature} • Intenções ativas: ${(payload.intents ?? []).length}`,
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 md:p-6">
      {/* Cabeçalho + Controles de Seed e Modais */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/60 p-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-bold text-foreground">
              Playground — Motor de Operações & Intenções
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Teste o fluxo Mobile (Drawer com passos divididos + carrosséis com
              busca) e Desktop (Dialog agrupado), incluindo intenções
              condicionais.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Smartphone className="size-3.5 text-primary" />
              Abrir no Drawer Mobile
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDesktopDialogOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Monitor className="size-3.5 text-primary" />
              Abrir no Dialog Desktop
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => resetWithSeed(seed)}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className="size-3.5" />
              Reiniciar
            </Button>
          </div>
        </div>

        {/* Presets de Seed */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
          <span className="text-xs font-semibold text-muted-foreground mr-1">
            Seeds:
          </span>
          {PLAYGROUND_SEED_PRESETS.map((preset) => {
            const active = activePresetId === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                title={preset.description}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
                  active
                    ? "border-primary bg-primary/12 text-primary font-semibold"
                    : "border-border/70 bg-background/60 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Play className="size-3" />
                <span>{preset.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Área Principal: Simulador Inline + Inspector Raio-X */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Coluna Esquerda: Simulador Inline */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card/50 px-3.5 py-2">
            <span className="text-xs font-semibold text-foreground">
              Bancada Inline ({previewViewport.toUpperCase()})
            </span>

            <div className="inline-flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => setPreviewViewport("mobile")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                  previewViewport === "mobile"
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Smartphone className="size-3.5" />
                Mobile (Passos Divididos)
              </button>

              <button
                type="button"
                onClick={() => setPreviewViewport("desktop")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                  previewViewport === "desktop"
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Monitor className="size-3.5" />
                Desktop (Agrupado)
              </button>
            </div>
          </div>

          <div
            className={cn(
              "mx-auto w-full rounded-2xl border border-border bg-popover p-4 shadow-sm transition-all",
              previewViewport === "mobile" ? "max-w-[400px]" : "max-w-xl"
            )}
          >
            <OperationWizardContent
              viewport={previewViewport}
              onComplete={handleComplete}
            />
          </div>

          {lastSubmittedPayload && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-500">
                <CheckCircle2 className="size-4" />
                <span>Último Payload Confirmado</span>
              </div>
              <pre className="max-h-40 overflow-auto rounded-lg bg-background/80 p-2.5 font-mono text-[11px]">
                {JSON.stringify(lastSubmittedPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Coluna Direita: Painel Raio-X */}
        <div className="lg:col-span-5">
          <OperationInspectorPanel activeViewport={previewViewport} />
        </div>
      </div>

      {/* Modal Real Desktop (Dialog) */}
      <OperationWizardModalViewDesktop
        isOpen={isDesktopDialogOpen}
        onClose={() => setIsDesktopDialogOpen(false)}
        onOpenChangeComplete={() => {}}
        onComplete={handleComplete}
      />

      {/* Modal Real Mobile (Drawer) */}
      <OperationWizardModalViewMobile
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        onOpenChangeComplete={() => {}}
        onComplete={handleComplete}
      />
    </div>
  )
}

export function OperationPlaygroundView() {
  return (
    <OperationWizardProvider lookups={MOCK_OPERATION_OPTIONS}>
      <PlaygroundWorkspace />
    </OperationWizardProvider>
  )
}

