import { routes, RouteKey } from "./config";
import { Crumb, RouteParams, RouteDefinition } from "./types";

export function buildHref(pattern: string, params: Record<string, string | number> = {}) {
  return pattern.replace(/\[([^\]]+)\]/g, (_, name) => encodeURIComponent(String(params[name])))
}

export function matchRoute(pathname: string): { key: RouteKey; params: Record<string, string> } | null {
  const normalized = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  
  let bestMatch: { key: RouteKey; params: Record<string, string>; staticParts: number } | null = null;

  for (const [key, def] of Object.entries(routes)) {
    const pattern = def.pattern;
    const regexStr = "^" + pattern.replace(/\[([^\]]+)\]/g, "(?<$1>[^/]+)") + "$";
    const regex = new RegExp(regexStr);
    const match = normalized.match(regex);
    
    if (match) {
      const staticParts = pattern.split("/").filter(p => p && !p.startsWith("[")).length;
      if (!bestMatch || staticParts > bestMatch.staticParts) {
        bestMatch = {
          key: key as RouteKey,
          params: match.groups || {},
          staticParts
        };
      }
    }
  }

  if (bestMatch) {
    return { key: bestMatch.key, params: bestMatch.params };
  }
  return null;
}

export function buildTrail(pathname: string, labels: Partial<Record<RouteKey, string>>): Crumb[] {
  const match = matchRoute(pathname);
  if (!match) return [];

  const trail: Crumb[] = [];
  let currentKey: RouteKey | undefined = match.key;

  while (currentKey) {
    const def = routes[currentKey] as RouteDefinition<RouteKey>;
    let label = labels[currentKey];
    label ??= typeof def.label === "function" ? def.label(match.params) : def.label;
    
    trail.unshift({
      key: currentKey,
      label: label as string,
      href: buildHref(def.pattern, match.params),
      isCurrent: trail.length === 0,
    });
    
    currentKey = def.parent;
  }
  
  return trail;
}

export function routeHref<K extends RouteKey>(key: K, params?: RouteParams<K>): string {
  const def = routes[key];
  return buildHref(def.pattern, params as Record<string, string | number>);
}
