import type { RecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import type { RecurrenceCategoryOptions } from "@/modules/recurrences/infra/mock/recurrence-category-options.mock";

export interface RecurrenceWizardProps {
  /** Opções de categoria/subcategoria */
  options: RecurrenceCategoryOptions;
  /** Valores iniciais para o formulário */
  initialData?: Partial<RecurrenceFormValues>;
  /** Executado ao concluir todas as etapas com dados validados */
  onSubmit: (data: RecurrenceFormValues) => void | Promise<void>;
  /** Executado ao fechar ou cancelar o wizard */
  onClose?: () => void;
  /** Texto do botão de submissão na etapa final */
  submitText?: string;
  /** `edit`: só nome e categoria padrão (padrão: `create`) */
  variant?: "create" | "edit";
  className?: string;
}
