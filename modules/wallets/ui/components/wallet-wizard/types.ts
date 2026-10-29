import type { CreateWalletFormValues } from "@/modules/wallets/models/wallet.schema";

export interface WalletWizardProps {
  /** Valores iniciais para o formulário (útil para edição ou rascunhos) */
  initialData?: Partial<CreateWalletFormValues>;
  /** Callback executado ao concluir todas as etapas com dados validados */
  onSubmit: (data: CreateWalletFormValues) => void | Promise<void>;
  /** Callback executado ao fechar ou cancelar o wizard */
  onClose?: () => void;
  /** Texto do botão de submissão na etapa final (padrão: "Confirmar e Salvar") */
  submitText?: string;
  /** Classes CSS adicionais */
  className?: string;
}
