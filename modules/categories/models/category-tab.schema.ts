import { z } from "zod";
import type { CategoryAppearance } from "./category.schema";

/**
 * Identificador padrão de cada aba de detalhes (UPPERCASE).
 */
export const CategoryDetailTabEnumSchema = z.enum([
  "OVERVIEW_INDICATORS",
  "ROOT_INDICATORS",
  "ROOT_ENTRIES",
  "CHILDREN",
  "LEAF_INDICATORS",
  "LEAF_ENTRIES",
]);
export type CategoryDetailTabEnum = z.infer<typeof CategoryDetailTabEnumSchema>;

/**
 * Representação da aba na query string da URL (?tab=...)
 */
export const CategoryUrlTabEnumSchema = z.enum([
  "INDICATORS",
  "ENTRIES",
  "CHILDREN",
]);
export type CategoryUrlTabEnum = z.infer<typeof CategoryUrlTabEnumSchema>;

/**
 * Mapeamento entre o enum CategoryUrlTabEnum e a string na URL (?tab=...)
 */
export const CATEGORY_URL_TAB_MAP = {
  INDICATORS: "indicators",
  ENTRIES: "entries",
  CHILDREN: "children",
} as const satisfies Record<CategoryUrlTabEnum, string>;

export const CATEGORY_URL_TAB_REVERSE_MAP: Record<string, CategoryUrlTabEnum> = {
  indicators: "INDICATORS",
  entries: "ENTRIES",
  children: "CHILDREN",
};

export function parseCategoryUrlTab(tabParam?: string | null): CategoryUrlTabEnum | null {
  if (!tabParam) return null;
  return CATEGORY_URL_TAB_REVERSE_MAP[tabParam.toLowerCase()] ?? null;
}

export interface CategoryTabMeta {
  label: string;
  urlTab: CategoryUrlTabEnum;
  urlTabString: string;
}

export const CATEGORY_TAB_METADATA: Record<CategoryDetailTabEnum, CategoryTabMeta> = {
  OVERVIEW_INDICATORS: {
    label: "Indicadores",
    urlTab: "INDICATORS",
    urlTabString: "indicators",
  },
  ROOT_INDICATORS: {
    label: "Indicadores",
    urlTab: "INDICATORS",
    urlTabString: "indicators",
  },
  ROOT_ENTRIES: {
    label: "Lançamentos",
    urlTab: "ENTRIES",
    urlTabString: "entries",
  },
  CHILDREN: {
    label: "Subcategorias",
    urlTab: "CHILDREN",
    urlTabString: "children",
  },
  LEAF_INDICATORS: {
    label: "Indicadores",
    urlTab: "INDICATORS",
    urlTabString: "indicators",
  },
  LEAF_ENTRIES: {
    label: "Lançamentos",
    urlTab: "ENTRIES",
    urlTabString: "entries",
  },
};

/**
 * Escopo estrutural da categoria no detalhe.
 */
export const CategoryScopeEnumSchema = z.enum([
  "OVERVIEW",
  "ROOT",
  "LEAF",
]);
export type CategoryScopeEnum = z.infer<typeof CategoryScopeEnumSchema>;

/**
 * DTO com informações básicas e abas disponíveis da categoria / visão geral.
 */
export const CategoryBasicInfoDTOSchema = z.object({
  scope: CategoryScopeEnumSchema,
  id: z.number().int().positive().nullable().optional(),
  name: z.string().min(1),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  appearance: z.custom<CategoryAppearance>().optional(),
  parentId: z.number().int().positive().nullable().optional(),
  parentName: z.string().nullable().optional(),
  period: z.object({
    from: z.date(),
    to: z.date(),
  }),
  availableTabs: z.array(CategoryDetailTabEnumSchema),
  defaultTab: CategoryUrlTabEnumSchema,
});
export type CategoryBasicInfoDTO = z.infer<typeof CategoryBasicInfoDTOSchema>;
