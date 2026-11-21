import type { InstallmentFormValues } from "@/modules/installments/models/schemas/installment-form.schema";
import type { InstallmentFormOptions } from "@/modules/installments/models/schemas/installment-form-options.schema";

export interface InstallmentWizardProps {
  /** Categorias, subcategorias e cartões */
  options: InstallmentFormOptions;
  /** Valores iniciais para o formulário */
  initialData?: Partial<InstallmentFormValues>;
  /** Executado ao concluir todas as etapas com dados validados */
  onSubmit: (data: InstallmentFormValues) => void | Promise<void>;
  /** Executado ao fechar ou cancelar o wizard */
  onClose?: () => void;
  /** Texto do botão de submissão na etapa final */
  submitText?: string;
  className?: string;
}
