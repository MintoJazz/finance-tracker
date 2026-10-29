import { cookies } from "next/headers";
import { decryptToken, encryptToken } from "../cryptography/jwt-utils";

const SESSION_COOKIE_NAME = "session_token";

export class SessionHandler {
    static async create(partyId: number, contextId: number) {
        const cookieStore = await cookies();

        const token = await encryptToken({ partyId, contextId });

        cookieStore.set(SESSION_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7
        });
    }

    // Utilitário para você usar nos seus Server Components depois
    static async getSession() {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        if (!token) return null;

        return await decryptToken(token);
    }

    static async destroy() {
        const cookieStore = await cookies();
        cookieStore.delete(SESSION_COOKIE_NAME);
    }
}