import { Auth as PrismaAuth } from "@/prisma/generated/prisma/client";
import { Auth } from "@/modules/auth/models/auth.schema";

export class AuthMapper {
    static toDomain(raw: PrismaAuth): Auth {
        const { ...auth } = raw;
        return { ...auth };
    }
}