import { WalletEntity } from "../schemas/wallet.schema";

export interface CreateWalletRepositoryDTO {
    contextId: number;
    name: string;
}

export interface UpdateWalletRepositoryDTO {
    name: string;
}

export interface IWalletRepository {
    create(data: CreateWalletRepositoryDTO): Promise<{ id: number; name: string }>;
    findByIdAndContextId(id: number, contextId: number): Promise<WalletEntity | null>;
    update(id: number, contextId: number, data: UpdateWalletRepositoryDTO): Promise<{ id: number; name: string }>;
    archive(id: number, contextId: number): Promise<{ id: number; name: string }>;
    restore(id: number, contextId: number): Promise<{ id: number; name: string }>;
}