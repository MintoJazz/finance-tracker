import type { UseFormReturn } from "react-hook-form";
import type { CategoryFormValues } from "@/modules/categories/models/category.schema";
import type { CategoryParentSummary } from "../../components/category-form/types";

export interface CreateCategoryModalInput {
  defaultValues?: Partial<CategoryFormValues>;
  parentCategory?: CategoryParentSummary | null;
}

export interface CreateCategoryModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  parentCategory?: CategoryParentSummary | null;
  form: UseFormReturn<CategoryFormValues>;
  onSubmit: (data: CategoryFormValues) => void;
  onClose: () => void;
  onOpenChangeComplete: (open: boolean) => void;
}

