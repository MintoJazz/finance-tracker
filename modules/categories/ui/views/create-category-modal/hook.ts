"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CategoryFormSchema,
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
  type CategoryFormValues,
} from "@/modules/categories/models/category.schema";
import { resolveCategoryHexColor } from "../../components/category-color-picker";
import { createCategoryAction } from "../../actions/create-category.action";
import { toast } from "@/components/ui/toast";
import type {
  CreateCategoryModalInput,
  CreateCategoryModalProps,
} from "./types";

export function useCreateCategoryModal(
  input?: CreateCategoryModalInput
): CreateCategoryModalProps {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasNavigatedRef = useRef(false);

  const parentCategory = input?.parentCategory ?? null;

  const initialColor = input?.defaultValues?.color
    ? resolveCategoryHexColor(input.defaultValues.color)
    : parentCategory?.color
      ? resolveCategoryHexColor(parentCategory.color)
      : DEFAULT_CATEGORY_COLOR;

  const initialIcon =
    input?.defaultValues?.icon ??
    parentCategory?.icon ??
    DEFAULT_CATEGORY_ICON;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: input?.defaultValues?.name ?? "",
      color: initialColor,
      icon: initialIcon,
      parentId: parentCategory?.id ?? input?.defaultValues?.parentId ?? null,
    },
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

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    const isSubcategory = Boolean(parentCategory?.id || data.parentId);

    try {
      const payload: CategoryFormValues = {
        ...data,
        parentId: parentCategory?.id ?? data.parentId ?? null,
      };

      const result = await createCategoryAction(payload);

      if (!result.success) {
        setIsSubmitting(false);
        toast.add({
          type: "error",
          title: isSubcategory
            ? "Erro ao criar subcategoria"
            : "Erro ao criar categoria",
          description:
            result.error ??
            (isSubcategory
              ? "Não foi possível criar a subcategoria."
              : "Não foi possível criar a categoria."),
          priority: "high",
        });
        return;
      }

      toast.add({
        type: "success",
        title: isSubcategory ? "Subcategoria criada" : "Categoria criada",
        description: isSubcategory
          ? `A subcategoria "${data.name}" foi adicionada em "${parentCategory?.name ?? "categoria pai"}".`
          : `A categoria "${data.name}" foi criada com sucesso.`,
      });

      onClose();
    } catch (error) {
      setIsSubmitting(false);
      console.error(
        "[useCreateCategoryModal] Falha ao criar categoria:",
        error
      );
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
    parentCategory,
    form,
    onSubmit,
    onClose,
    onOpenChangeComplete,
  };
}

