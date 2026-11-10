import type {
  CategoryOption,
  CreditCycleOption,
  CustodyOption,
  SubcategoryOption,
} from "../../models/operation-options.schema"

export interface ICustodyOptionsProvider {
  listCustodyOptions(spaceId?: number): Promise<CustodyOption[]>
}

export interface ICreditCycleOptionsProvider {
  listCreditCycleOptions(spaceId?: number): Promise<CreditCycleOption[]>
}

export interface ICategoryOptionsProvider {
  listCategoryOptions(spaceId?: number): Promise<CategoryOption[]>
}

export interface ISubcategoryOptionsProvider {
  listSubcategoryOptions(spaceId?: number): Promise<SubcategoryOption[]>
}

