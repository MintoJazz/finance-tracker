"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/toast";
import {
  DEFAULT_RENAME_CONTRACT_FORM_VALUES,
  RenameContractFormSchema,
  type RenameContractFormValues,
} from "@/modules/contracts/models/rename-contract-form.schema";
import type { RenameContractModalInput, RenameContractModalProps } from "./types";

export function useRenameContractModal(input?: RenameContractModalInput): RenameContractModalProps {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = input?.isOpen ?? internalOpen;

  const initialValues = useMemo<RenameContractFormValues>(() => {
    return {
      ...DEFAULT_RENAME_CONTRACT_FORM_VALUES,
      name: input?.contractName ?? "",
    };
  }, [input?.contractName]);

  const form = useForm<RenameContractFormValues>({
    resolver: zodResolver(RenameContractFormSchema) as any,
    defaultValues: initialValues as any,
    values: input?.contractName !== undefined ? ({ name: input.contractName } as any) : undefined,
  });

  const onClose = useCallback(() => {
    if (input?.onClose) {
      input.onClose();
    } else {
      setInternalOpen(false);
    }
  }, [input]);

  const onSubmit = async (values: RenameContractFormValues) => {
    setIsSubmitting(true);
    try {
      if (input?.onSuccess) {
        await Promise.resolve(input.onSuccess(values.name));
      }

      toast.add({
        type: "success",
        title: "Contrato renomeado",
        description: "O nome do contrato foi atualizado com sucesso.",
      });

      onClose();
    } catch (error) {
      console.error("[RenameContractModal] Erro ao renomear contrato:", error);
      toast.add({
        type: "error",
        title: "Erro ao renomear",
        description: "Ocorreu um erro interno ao renomear o contrato.",
        priority: "high",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    contractId: input?.contractId ?? 0,
    contractName: input?.contractName ?? "",
    isOpen,
    isSubmitting,
    form,
    onSubmit,
    onClose,
    onSuccess: input?.onSuccess,
  };
}

export { useRenameContractModal as useRenameContractModalHook };
