import type { CardFormValues } from "@/modules/account/core/schemas/card.schema";

export interface CardWizardProps {
  /** Valores iniciais para o formulário (útil para edição ou rascunhos) */
  initialData?: Partial<CardFormValues>;
  /** Callback executado ao concluir todas as etapas com dados validados */
  onSubmit: (data: CardFormValues) => void | Promise<void>;
  /** Callback executado ao fechar ou cancelar o wizard */
  onClose?: () => void;
  /** Texto do botão de submissão na etapa final (padrão: "Confirmar e Salvar") */
  submitText?: string;
  /** Classes CSS adicionais */
  className?: string;
}
