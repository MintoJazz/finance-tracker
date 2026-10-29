import { Party } from "@/modules/auth/models/party.schema";
import { Profile } from "@/modules/auth/models/profile.schema";

export interface CreatePartyDTO {
  name: string;
  documentNumber: string;
  birthDate?: Date | null;
  phone?: string | null;
}

export interface IPartyRepository {
  findById(id: number): Promise<Party | null>;
  findProfileById(id: number): Promise<Profile | null>;
  findByDocumentNumber(documentNumber: string): Promise<Party | null>;
  create(data: CreatePartyDTO): Promise<Party>;
  updateAvatar(partyId: number, avatarUrl: string): Promise<void>;
}
