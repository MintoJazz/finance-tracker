/* eslint-disable @typescript-eslint/no-explicit-any -- os campos/schemas de cada domínio têm tipos de form distintos (mesmo padrão do wizard) */
import type { FieldValues } from "react-hook-form";
import type { z } from "zod";
import type { FormField } from "@/types/form.types";

/**
 * Configuração de um formulário de ajuste (prazos ou valor/limite).
 * Desktop: Dialog de passo único (campos + vigência).
 * Mobile: Drawer com 2 passos (campos → "Quando aplicar").
 */
export interface AdjustFormProps<TForm extends FieldValues = FieldValues> {
    isOpen: boolean;
    /** Título do Dialog (desktop). Ex.: "Ajustar prazos" */
    title: string;
    /** Descrição do Dialog (desktop). */
    description: string;
    /** Título do passo 1 no mobile. Ex.: "Prazos" */
    stepTitle: string;
    /** Schema completo (campos + vigência) usado no passo único do desktop. */
    schema: z.ZodType<FieldValues, any, any>;
    /** Schema só dos campos (sem vigência) usado no passo 1 do mobile. */
    detailsSchema: z.ZodType<FieldValues, any, any>;
    fields: FormField<any>[];
    initialData: Partial<TForm>;
    submitText?: string;
    onSubmit: (data: TForm) => void | Promise<void>;
    onClose: () => void;
    onOpenChangeComplete?: (open: boolean) => void;
}
