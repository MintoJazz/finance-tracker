export interface ArchiveCategoryModalInput {
  id: number;
  name: string;
  parentId?: number | null;
}

export interface ArchiveCategoryModalProps {
  isOpen: boolean;
  entityName?: string;
  categoryName?: string;
  itemName?: string;
  isSubcategory?: boolean;
  isSubmitting: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  onOpenChangeComplete?: (open: boolean) => void;
}

