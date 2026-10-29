import bcrypt from "bcryptjs";
import { IPasswordHasher } from "@/modules/auth/application/interfaces/password-hasher.interface";

export class BcryptHasher implements IPasswordHasher {
    private readonly saltCoust = 10;

    async hash(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltCoust);
    }

    async compare(password: string, hashDB: string): Promise<boolean> {
        return await bcrypt.compare(password, hashDB);
    }
}