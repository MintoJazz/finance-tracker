import { headers } from "next/headers";
import { userAgent } from "next/server";
import type { ViewPort } from "@/types/adaptive.types";

/**
 * Detecta o viewport inicial com base no cabeçalho User-Agent da requisição.
 * Deve ser executado em Server Components ou Server Actions.
 */
export async function getDeviceViewport(): Promise<ViewPort> {
    const headerList = await headers();
    const ua = userAgent({ headers: headerList });

    const isMobile = ua.device.type === "mobile";
    return isMobile ? "mobile" : "desktop";
}

