import { Party } from "../schemas/party.schema";
import { Profile } from "../schemas/profile.schema";

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
