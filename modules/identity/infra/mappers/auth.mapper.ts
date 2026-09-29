import { Auth as PrismaAuth } from "@/prisma/generated/prisma/client";
import { Auth } from "../../core/schemas/auth.schema";
import { CreateUserType } from "../../core/schemas/signup.schema";
import { ContextMemberCreateNestedManyWithoutPartyInput, PartyCreateInput } from "@/prisma/generated/prisma/models";

export class AuthMapper {
    static toPrismaCreateInput(data: CreateUserType): PartyCreateInput {
        const { passwordHash: password, email, ...basicData } = data

        const auth = {
            create: { email, password }
        }

        const contexts: ContextMemberCreateNestedManyWithoutPartyInput = {
            create: {
                role: "OWNER",
                status: "ACTIVE",
                joinedAt: new Date(),
                financialContext: {
                    create: { name: `Espaço de ${data.name}` }
                }
            }
        }

        return { ...basicData, auth, contexts };
    }

    static toDomain(raw: PrismaAuth): Auth {
        const { ...auth } = raw
        return { ...auth };
    }
}