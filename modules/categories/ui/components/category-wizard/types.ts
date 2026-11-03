import type { CategoryFormValues } from "@/modules/categories/models/category.schema";
import type { CategoryParentSummary } from "../category-form/types";

export interface CategoryWizardProps {
  /** Valores iniciais para o formulário (útil para edição ou rascunhos) */
  initialData?: Partial<CategoryFormValues>;
  /** Categoria pai quando criando uma subcategoria */
  parentCategory?: CategoryParentSummary | null;
  /** Callback executado ao concluir todas as etapas com dados validados */
  onSubmit: (data: CategoryFormValues) => void | Promise<void>;
  /** Callback executado ao fechar ou cancelar o wizard */
  onClose?: () => void;
  /** Texto do botão de submissão na etapa final */
  submitText?: string;
  /** Classes CSS adicionais */
  className?: string;
}

