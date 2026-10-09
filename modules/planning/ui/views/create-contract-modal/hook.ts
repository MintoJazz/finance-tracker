"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ContractFormSchema,
  DEFAULT_CONTRACT_FORM_VALUES,
  type ContractFormValues,
} from "../../../core/schemas/contract-form.schema";
import { createContractAction } from "../../actions/create-contract.action";
import { toast } from "@/components/ui/toast";
import type { CreateContractModalInput, CreateContractModalProps } from "./types";

export function useCreateContractModal(
  input?: CreateContractModalInput
): CreateContractModalProps {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasNavigatedRef = useRef(false);

  const initialValues: ContractFormValues = {
    ...DEFAULT_CONTRACT_FORM_VALUES,
    ...input?.defaultValues,
    validity: {
      from: input?.defaultValues?.validity?.from ?? new Date(),
      to: input?.defaultValues?.validity?.to,
    },
  };

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(ContractFormSchema),
    defaultValues: initialValues,
  });

  const navigateBack = useCallback(() => {
    if (!hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      router.back();
    }
  }, [router]);

  const onClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      navigateBack();
    }, 300);
  }, [navigateBack]);

  const onOpenChangeComplete = useCallback(
    (open: boolean) => {
      if (!open) {
        navigateBack();
      }
    },
    [navigateBack]
  );

  const onSubmit = async (data: ContractFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createContractAction(data);

      if (!result.success) {
        setIsSubmitting(false);
        toast.add({
          type: "error",
          title: "Erro ao criar contrato",
          description: result.error ?? "Não foi possível criar o contrato.",
          priority: "high",
        });
        return;
      }

      toast.add({
        type: "success",
        title: "Contrato criado",
        description: `O contrato "${data.name}" foi criado com sucesso.`,
      });

      router.refresh();
      onClose();
    } catch (error) {
      setIsSubmitting(false);
      console.error("[useCreateContractModal] Falha ao criar contrato:", error);
      toast.add({
        type: "error",
        title: "Erro inesperado",
        description: "Ocorreu um erro interno. Tente novamente mais tarde.",
        priority: "high",
      });
    }
  };

  return {
    isOpen,
    isSubmitting,
    form,
    onSubmit,
    onClose,
    onOpenChangeComplete,
    initialValues,
  };
}
