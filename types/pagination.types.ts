export interface PageRequest {
  page: number
  pageSize: number
}

export interface Page<T> {
  data: T[]
  total: number
  pageIndex: number
  pageSize: number
  pageCount: number
}