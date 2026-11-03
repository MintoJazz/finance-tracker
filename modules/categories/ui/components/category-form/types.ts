import type { UseFormReturn } from "react-hook-form";
import type { CategoryFormValues } from "@/modules/categories/models/category.schema";

export interface CategoryParentSummary {
  id: number;
  name: string;
  icon?: string | null;
  color?: string | null;
}

export interface CategoryFormContext {
  parentCategory?: CategoryParentSummary | null;
}

export interface CategoryFormProps {
  form: UseFormReturn<CategoryFormValues>;
  onSubmit: (data: CategoryFormValues) => void;
  onCancel: () => void;
  parentCategory?: CategoryParentSummary | null;
  isSubmitting?: boolean;
  submitText?: string;
  submitLoadingText?: string;
}

