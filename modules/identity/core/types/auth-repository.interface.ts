import { Auth } from "../schemas/auth.schema";
import { Party } from "../schemas/party.schema";
import { CreateUserType } from "../schemas/signup.schema";

export interface IAuthRepository {
    findPartyById(id: number): Promise<Party | null>;
    findAuthByEmail(email: string): Promise<Auth | null>;
    findDefaultContext(partyId: number): Promise<{ contextId: number }> | null;
    updateLastLoginAt(partyId: number, date: Date): Promise<void>;
    create(data: CreateUserType): Promise<Auth>;
}