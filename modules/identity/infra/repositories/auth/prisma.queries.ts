import { AuthGetPayload, AuthInclude, AuthWhereInput } from "@/prisma/generated/prisma/models";

export const AuthDefaultIncludes = {
    party: true,
} satisfies AuthInclude;

export const byEmailAndActive = (email: string): AuthWhereInput => ({
    email: email,
    party: {
        contexts: {
            some: { status: "ACTIVE" }
        }
    }
});

export type AuthWithPartyPrismaModel = AuthGetPayload<{
    include: typeof AuthDefaultIncludes;
}>;