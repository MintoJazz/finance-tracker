"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/toast";
import {
  DEFAULT_ADJUST_CONTRACT_LIMITS_FORM_VALUES,
  AdjustContractLimitsFormSchema,
  type AdjustContractLimitsFormValues,
} from "@/modules/contracts/models/adjust-contract-limits-form.schema";
import { adjustContractLimitsAction } from "@/modules/contracts/ui/actions/adjust-contract-limits.action";
import type { AdjustContractLimitsModalInput, AdjustContractLimitsModalProps } from "./types";

export function useAdjustContractLimitsModal(input?: AdjustContractLimitsModalInput): AdjustContractLimitsModalProps {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = input?.isOpen ?? internalOpen;

  const initialValues = useMemo<AdjustContractLimitsFormValues>(() => {
    return {
      ...DEFAULT_ADJUST_CONTRACT_LIMITS_FORM_VALUES,
      value: input?.initialValue ?? 0,
    };
  }, [input?.initialValue]);

  const form = useForm<AdjustContractLimitsFormValues>({
    resolver: zodResolver(AdjustContractLimitsFormSchema) as any,
    defaultValues: initialValues as any,
    values: input?.initialValue !== undefined ? ({ ...initialValues, value: input.initialValue } as any) : undefined,
  });

  const onClose = useCallback(() => {
    if (input?.onClose) {
      input.onClose();
    } else {
      setInternalOpen(false);
    }
  }, [input]);

  const onSubmit = async (values: AdjustContractLimitsFormValues) => {
    setIsSubmitting(true);
    try {
      const contractId = input?.contractId;
      if (contractId) {
        const result = await adjustContractLimitsAction(contractId, values);
        if (!result.success) {
          toast.add({
            type: "error",
            title: "Erro ao ajustar limites",
            description: result.error ?? "Não foi possível ajustar os limites do contrato.",
            priority: "high",
          });
          return;
        }
      }

      if (input?.onSuccess) {
        await Promise.resolve(input.onSuccess(values));
      }

      toast.add({
        type: "success",
        title: "Limites ajustados",
        description: "O ajuste de valor/limite será aplicado conforme a definição.",
      });

      onClose();
    } catch (error) {
      console.error("[AdjustContractLimitsModal] Erro ao ajustar limites:", error);
      toast.add({
        type: "error",
        title: "Erro ao ajustar limites",
        description: "Ocorreu um erro interno ao ajustar os limites.",
        priority: "high",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    contractId: input?.contractId ?? 0,
    contractName: input?.contractName,
    initialValue: input?.initialValue,
    isOpen,
    isSubmitting,
    form,
    onSubmit,
    onClose,
    onSuccess: input?.onSuccess,
  };
}
