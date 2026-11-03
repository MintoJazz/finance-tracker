import type { CategoryItem } from "@/modules/categories/models/category.schema";

export class CategoryMapper {
  static toItem(
    raw: {
      id: number;
      name: string;
      parentId: number | null;
      appearance?: {
        icon: string | null;
        color: string | null;
      } | null;
      _count?: {
        children: number;
      };
    },
    children: CategoryItem[] = []
  ): CategoryItem {
    const icon = raw.appearance?.icon ?? null;
    const color = raw.appearance?.color ?? null;

    return {
      id: raw.id,
      name: raw.name,
      icon,
      color,
      appearance: { icon, color },
      amount: 0,
      parentId: raw.parentId,
      childrenCount: raw._count?.children ?? children.length,
      children,
    };
  }
}

