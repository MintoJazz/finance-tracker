"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/toast";
import {
  DEFAULT_ADJUST_CONTRACT_SCHEDULE_FORM_VALUES,
  AdjustContractScheduleFormSchema,
  type AdjustContractScheduleFormValues,
} from "@/modules/contracts/models/adjust-contract-schedule-form.schema";
import type { ContractFrequencyEnum } from "@/modules/contracts/models/contract-form.schema";
import { adjustContractScheduleAction } from "@/modules/contracts/ui/actions/adjust-contract-schedule.action";
import type { AdjustContractScheduleModalInput, AdjustContractScheduleModalProps } from "./types";

function getDefaultSchedule(frequency: ContractFrequencyEnum) {
  if (frequency === "WEEKLY") {
    return { dueDay: 1, closingDay: null, dueMonth: null, closingMonth: null };
  }

  if (frequency === "YEARLY") {
    const now = new Date();
    return {
      dueDay: now.getDate(),
      closingDay: null,
      dueMonth: now.getMonth() + 1,
      closingMonth: null,
    };
  }

  return { dueDay: 10, closingDay: null, dueMonth: null, closingMonth: null };
}

export function useAdjustContractScheduleModal(input?: AdjustContractScheduleModalInput): AdjustContractScheduleModalProps {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = input?.isOpen ?? internalOpen;

  const initialValues = useMemo<AdjustContractScheduleFormValues>(() => {
    const frequency = input?.frequency ?? DEFAULT_ADJUST_CONTRACT_SCHEDULE_FORM_VALUES.frequency ?? "MONTHLY";
    const defaults = getDefaultSchedule(frequency);

    return {
      ...DEFAULT_ADJUST_CONTRACT_SCHEDULE_FORM_VALUES,
      frequency,
      hasCustomClosingDay: input?.initialClosingDay != null,
      schedule: {
        dueDay: input?.initialDueDay ?? defaults.dueDay,
        closingDay: input?.initialClosingDay ?? defaults.closingDay,
        dueMonth: input?.initialDueMonth ?? defaults.dueMonth,
        closingMonth: input?.initialClosingMonth ?? defaults.closingMonth,
      },
    };
  }, [
    input?.frequency,
    input?.initialDueDay,
    input?.initialClosingDay,
    input?.initialDueMonth,
    input?.initialClosingMonth,
  ]);

  const form = useForm<AdjustContractScheduleFormValues>({
    resolver: zodResolver(AdjustContractScheduleFormSchema),
    defaultValues: initialValues,
    values: initialValues,
  });

  const onClose = useCallback(() => {
    if (input?.onClose) {
      input.onClose();
    } else {
      setInternalOpen(false);
    }
  }, [input]);

  const onSubmit = async (values: AdjustContractScheduleFormValues) => {
    setIsSubmitting(true);
    try {
      const contractId = input?.contractId;
      if (contractId) {
        const result = await adjustContractScheduleAction(contractId, values);
        if (!result.success) {
          toast.add({
            type: "error",
            title: "Erro ao ajustar prazos",
            description: result.error ?? "Não foi possível ajustar os prazos do contrato.",
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
        title: "Prazos ajustados",
        description: "Os prazos do contrato serão aplicados conforme a definição.",
      });

      onClose();
    } catch (error) {
      console.error("[AdjustContractScheduleModal] Erro ao ajustar prazos:", error);
      toast.add({
        type: "error",
        title: "Erro ao ajustar prazos",
        description: "Ocorreu um erro interno ao ajustar os prazos.",
        priority: "high",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    contractId: input?.contractId ?? 0,
    contractName: input?.contractName,
    initialDueDay: input?.initialDueDay,
    initialClosingDay: input?.initialClosingDay,
    initialDueMonth: input?.initialDueMonth,
    initialClosingMonth: input?.initialClosingMonth,
    frequency: input?.frequency,
    isOpen,
    isSubmitting,
    form,
    onSubmit,
    onClose,
    onSuccess: input?.onSuccess,
  } as AdjustContractScheduleModalProps;
}
