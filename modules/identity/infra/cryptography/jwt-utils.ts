import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || "chave-secreta-temporaria-para-desenvolvimento-local"
);

export type SessionPayload = {
    partyId: number;
    contextId: number;
};

export async function encryptToken(payload: SessionPayload): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" }) // Algoritmo de assinatura
        .setIssuedAt()
        .setExpirationTime("7d") // Bate com o maxAge do cookie
        .sign(SECRET_KEY);
}

export async function decryptToken(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload as SessionPayload;
    } catch (error) {
        return null;
    }
}