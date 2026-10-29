import { Auth } from "@/modules/auth/models/auth.schema";

export interface CreateAuthDTO {
  partyId: number;
  email: string;
  passwordHash: string;
}

export interface IAuthRepository {
  findByEmail(email: string): Promise<Auth | null>;
  create(data: CreateAuthDTO): Promise<Auth>;
  updateLastLoginAt(partyId: number, date: Date): Promise<void>;
}