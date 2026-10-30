import { cookies, headers } from "next/headers";
import { userAgent } from "next/server";
import type { ViewPort } from "@/types/adaptive.types";

/**
 * Detecta o viewport inicial.
 * Prioridade:
 * 1. Cookie 'viewport' persistido pelo cliente (100% de precisão nos reloads/F5).
 * 2. Header 'sec-ch-ua-mobile' (Client Hints de navegadores móveis modernos).
 * 3. User-Agent parsing e regex para detecção de dispositivos móveis.
 */
export async function getDeviceViewport(): Promise<ViewPort> {
    const cookieStore = await cookies();
    const cookieViewport = cookieStore.get("viewport")?.value;
    if (cookieViewport === "mobile" || cookieViewport === "desktop") {
        return cookieViewport;
    }

    const headerList = await headers();

    if (headerList.get("sec-ch-ua-mobile") === "?1") {
        return "mobile";
    }

    const ua = userAgent({ headers: headerList });
    if (ua.device.type === "mobile" || ua.device.type === "tablet") {
        return "mobile";
    }

    const rawUa = headerList.get("user-agent") ?? "";
    const isMobileUa = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(rawUa);
    if (isMobileUa) {
        return "mobile";
    }

    return "desktop";
}

