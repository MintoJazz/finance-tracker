"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWizard } from "../core";

export interface WizardReviewCardProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
}

/**
 * Card contêiner padronizado para etapas de revisão do Wizard:
 * - Bordas arredondadas e fundo sutil em card
 * - Divisórias internas (divide-y) de ponta a ponta (sem padding horizontal nas linhas de separação)
 */
export function WizardReviewCard({
  className,
  children,
  ...props
}: WizardReviewCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/60 backdrop-blur-xs divide-y divide-border/50 overflow-hidden shadow-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface WizardReviewRowProps extends React.ComponentProps<"div"> {
  /** Rótulo superior do campo */
  label?: React.ReactNode;
  /** Valor principal do campo */
  value?: React.ReactNode;
  /** Subtítulo ou complemento ao lado do valor */
  description?: React.ReactNode;
  /** Ícone exibido em caixa destacada à esquerda */
  icon?: React.ReactNode;
  /** Badge exibida ao lado do valor */
  badge?: React.ReactNode;
  /** ID da etapa para navegar ao clicar no lápis de editar */
  stepId?: string;
  /** Callback customizado de edição alternativo ao stepId */
  onEdit?: () => void;
  /** Rótulo acessível para leitores de tela no botão de editar */
  editAriaLabel?: string;
  /** Oculta o botão de edição */
  hideEdit?: boolean;
  /** Elemento trailing customizado (sobrescreve o botão padrão de edição) */
  trailing?: React.ReactNode;
  /** Conteúdo livre (substitui o layout padrão de label/value) */
  children?: React.ReactNode;
}

/**
 * Linha padronizada de resumo com suporte a ícone, rótulo, valor, badges e botão de edição direta.
 * O padding interno é aplicado na linha, garantindo que as bordas divisórias do card fiquem 100% de ponta a ponta.
 */
export function WizardReviewRow({
  label,
  value,
  description,
  icon,
  badge,
  stepId,
  onEdit,
  editAriaLabel,
  hideEdit = false,
  trailing,
  className,
  children,
  ...props
}: WizardReviewRowProps) {
  let wizardGoTo: ((targetStepId: string) => void) | null = null;
  try {
    const wizard = useWizard();
    wizardGoTo = wizard.goTo;
  } catch {
    wizardGoTo = null;
  }

  const handleEdit =
    onEdit ?? (stepId && wizardGoTo ? () => wizardGoTo?.(stepId) : undefined);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-3.5 py-2.5 min-w-0 text-xs",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {icon && (
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {children ?? (
            <>
              {label && (
                <span className="text-[11px] text-muted-foreground block font-medium">
                  {label}
                </span>
              )}
              <div className="flex items-center gap-1.5 min-w-0">
                {badge}
                {value && (
                  <span className="font-semibold text-foreground truncate block text-sm">
                    {value}
                  </span>
                )}
                {description && (
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {description}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {trailing ??
        (!hideEdit && handleEdit ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleEdit}
            className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={
              editAriaLabel ??
              `Editar ${typeof label === "string" ? label : "etapa"}`
            }
          >
            <Pencil className="size-3.5" />
          </Button>
        ) : null)}
    </div>
  );
}

export interface WizardReviewHintProps extends React.ComponentProps<"p"> {
  children: React.ReactNode;
}

/**
 * Mensagem discreta de rodapé exibida abaixo do card de revisão
 */
export function WizardReviewHint({
  className,
  children,
  ...props
}: WizardReviewHintProps) {
  return (
    <p
      className={cn(
        "text-[11px] text-muted-foreground/80 text-center pt-0.5",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}
