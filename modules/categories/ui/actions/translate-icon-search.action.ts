"use server";

import { success, type Result } from "@/types/result.types";

const translationCache = new Map<string, string[]>();

function normalizeTerm(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim();
}

function splitTokens(terms: string[]): string[] {
  const set = new Set<string>();
  for (const raw of terms) {
    const norm = normalizeTerm(raw);
    if (!norm) continue;
    set.add(norm.replace(/\s+/g, ""));
    for (const part of norm.split(/[\s-]+/)) {
      if (part.length >= 2) {
        set.add(part);
      }
    }
  }
  return Array.from(set);
}

/**
 * Traduz um termo em português para palavras-chave em inglês usando a API pública
 * do Google Translate (gtx com tradução direta dt=t e dicionário de sinônimos dt=bd),
 * sem necessidade de catálogo manual de ícones.
 */
export async function translateIconSearchAction(
  query: string
): Promise<Result<string[]>> {
  const trimmed = query.trim();
  if (!trimmed) {
    return success([]);
  }

  const cacheKey = normalizeTerm(trimmed);
  if (!cacheKey) {
    return success([]);
  }

  const cached = translationCache.get(cacheKey);
  if (cached) {
    return success(cached);
  }

  const rawTerms: string[] = [cacheKey];

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=en&dt=t&dt=bd&q=${encodeURIComponent(
      trimmed
    )}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "force-cache",
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data: unknown = await response.json();

      if (Array.isArray(data)) {
        // 1. Tradução direta (data[0])
        if (Array.isArray(data[0])) {
          for (const segment of data[0]) {
            if (Array.isArray(segment) && typeof segment[0] === "string") {
              rawTerms.push(segment[0]);
            }
          }
        }

        // 2. Sinônimos do dicionário bilíngue (data[1])
        if (Array.isArray(data[1])) {
          for (const posEntry of data[1]) {
            if (Array.isArray(posEntry) && Array.isArray(posEntry[1])) {
              for (const synonym of posEntry[1]) {
                if (typeof synonym === "string") {
                  rawTerms.push(synonym);
                }
              }
            }
          }
        }
      }
    }
  } catch {
    // Fallback silencioso: mantém apenas o termo original normalizado
  }

  const resultTokens = splitTokens(rawTerms);
  translationCache.set(cacheKey, resultTokens);

  return success(resultTokens);
}

