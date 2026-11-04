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
import { updateCategoryAction } from "../../actions/update-category.action";
import { toast } from "@/components/ui/toast";
import type {
  EditCategoryModalInput,
  EditCategoryModalProps,
} from "./types";

export function useEditCategoryModal(
  input?: EditCategoryModalInput
): EditCategoryModalProps {
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

  const initialValues: CategoryFormValues = {
    name: input?.defaultValues?.name ?? "",
    color: initialColor,
    icon: initialIcon,
    parentId: parentCategory?.id ?? input?.defaultValues?.parentId ?? null,
  };

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: initialValues,
    values: input?.defaultValues ? initialValues : undefined,
  });

  const navigateBack = useCallback(() => {
    if (!hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      if (input?.id) {
        router.push(`/categories/${input.id}`);
      } else {
        router.back();
      }
    }
  }, [router, input?.id]);

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
    if (!input?.id) {
      toast.add({
        type: "error",
        title: "Erro ao atualizar categoria",
        description: "Identificador da categoria não encontrado.",
        priority: "high",
      });
      return;
    }

    setIsSubmitting(true);
    const isSubcategory = Boolean(parentCategory?.id || data.parentId);

    try {
      const result = await updateCategoryAction({
        id: input.id,
        name: data.name,
        color: data.color ?? null,
        icon: data.icon ?? null,
        parentId: parentCategory?.id ?? data.parentId ?? null,
      });

      if (!result.success) {
        setIsSubmitting(false);
        toast.add({
          type: "error",
          title: isSubcategory
            ? "Erro ao atualizar subcategoria"
            : "Erro ao atualizar categoria",
          description:
            result.error ??
            (isSubcategory
              ? "Não foi possível atualizar a subcategoria."
              : "Não foi possível atualizar a categoria."),
          priority: "high",
        });
        return;
      }

      toast.add({
        type: "success",
        title: isSubcategory
          ? "Subcategoria atualizada"
          : "Categoria atualizada",
        description: isSubcategory
          ? `A subcategoria "${data.name}" foi atualizada com sucesso.`
          : `A categoria "${data.name}" foi atualizada com sucesso.`,
      });

      onClose();
    } catch (error) {
      setIsSubmitting(false);
      console.error("[useEditCategoryModal] Falha ao atualizar categoria:", error);
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

