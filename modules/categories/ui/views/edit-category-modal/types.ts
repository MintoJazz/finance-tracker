import type { UseFormReturn } from "react-hook-form";
import type { CategoryFormValues } from "@/modules/categories/models/category.schema";
import type { CategoryParentSummary } from "../../components/category-form/types";

export interface EditCategoryModalInput {
  id: number;
  parentCategory?: CategoryParentSummary | null;
  defaultValues?: Partial<CategoryFormValues>;
}

export interface EditCategoryModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  parentCategory?: CategoryParentSummary | null;
  form: UseFormReturn<CategoryFormValues>;
  onSubmit: (data: CategoryFormValues) => void;
  onClose: () => void;
  onOpenChangeComplete: (open: boolean) => void;
}

