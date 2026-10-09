import { CardEntity } from "../schemas/card.schema"

export interface CreateCardRepositoryDTO {
  contextId: number
  name: string
  limit: number
  closingDay: number
  dueDay: number
}

export interface UpdateCardRepositoryDTO {
  name: string
  limit: number
  closingDay: number
  dueDay: number
}

export interface ICardRepository {
  create(data: CreateCardRepositoryDTO): Promise<{ id: number; name: string }>
  findByIdAndContextId(
    id: number,
    contextId: number
  ): Promise<CardEntity | null>
  update(
    id: number,
    contextId: number,
    data: UpdateCardRepositoryDTO
  ): Promise<{ id: number; name: string }>
  archive(id: number): Promise<{ id: number; name: string }>
  restore(id: number): Promise<{ id: number; name: string }>
}
