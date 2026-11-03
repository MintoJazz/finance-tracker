import type {
  CategoryItem,
  ArchivedCategoryGroup,
  ArchivedSubcategory,
} from "@/modules/categories/models/category.schema";

export interface RawCategoryBalanceRecord {
  id: number;
  name: string;
  parentId: number | null;
  removedAt?: Date | null;
}

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

  /**
   * Agrupa categorias e subcategorias arquivadas no formato consumido pela UI.
   *
   * Regras:
   * 1. Categoria arquivada (parentId = null, removedAt != null) -> archived: true com suas subcategorias arquivadas em children.
   * 2. Subcategoria arquivada cujo pai está ativo -> pai entra com archived: false apenas como contexto.
   * 3. Categoria ativa sem subcategorias arquivadas não aparece.
   * 4. Subcategoria ativa sob pai arquivado viola o invariante de cascata (ao arquivar o pai, todas
   *    as filhas devem ser arquivadas). Mesmo se existisse no banco, não é incluída em children
   *    porque este fluxo lista apenas filhas efetivamente arquivadas.
   * 5. Ordenação alfabética em pt-BR de grupos e de filhas dentro do grupo.
   */
  static toArchivedGroups(
    archivedBalances: RawCategoryBalanceRecord[],
    activeParents: RawCategoryBalanceRecord[] = []
  ): ArchivedCategoryGroup[] {
    // Identifica raízes arquivadas
    const archivedRoots = archivedBalances.filter(
      (b) => b.parentId === null && Boolean(b.removedAt)
    );

    // Identifica filhas arquivadas
    const archivedChildren = archivedBalances.filter(
      (b) => b.parentId !== null && Boolean(b.removedAt)
    );

    // Mapeia filhas agrupadas por parentId
    const childrenByParentId = new Map<number, ArchivedSubcategory[]>();
    for (const child of archivedChildren) {
      if (child.parentId === null) continue;
      const list = childrenByParentId.get(child.parentId) ?? [];
      list.push({ id: child.id, name: child.name });
      childrenByParentId.set(child.parentId, list);
    }

    const groups: ArchivedCategoryGroup[] = [];

    // 1. Grupos de categorias arquivadas (mesmo se children for vazio)
    for (const root of archivedRoots) {
      const children = (childrenByParentId.get(root.id) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR")
      );

      groups.push({
        id: root.id,
        name: root.name,
        archived: true,
        children,
      });
    }

    // 2. Grupos de pais ativos com filhas arquivadas (apenas como contexto)
    for (const parent of activeParents) {
      const children = (childrenByParentId.get(parent.id) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR")
      );

      // Categoria ativa sem subcategorias arquivadas não aparece
      if (children.length > 0) {
        groups.push({
          id: parent.id,
          name: parent.name,
          archived: false,
          children,
        });
      }
    }

    // Ordenação alfabética dos grupos
    return groups.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }
}


