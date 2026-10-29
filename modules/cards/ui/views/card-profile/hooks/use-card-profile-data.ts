"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
    CardCycleOption,
    CardProfile,
} from "@/modules/cards/models/card-profile.schema";
import { getCardProfileAction } from "@/modules/cards/ui/actions/get-card-profile.action";
import { WalletMovementFilters } from "@/modules/movements/models/wallet-movement.schema";
import { CardCycleNavigationContext } from "../types";

export interface UseCardProfileDataReturn {
    profile: CardProfile | null;
    isLoadingProfile: boolean;
    profileError: string | null;
    reloadProfile: () => Promise<void>;
}

export function useCardProfileData(
    cardId: number,
    initialProfile?: CardProfile | null
): UseCardProfileDataReturn {
    const pathname = usePathname();
    const prevPathnameRef = useRef<string>(pathname);
    const hasMountedRef = useRef(false);
    const [profile, setProfile] = useState<CardProfile | null>(initialProfile ?? null);
    const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(!initialProfile);
    const [profileError, setProfileError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        try {
            const result = await getCardProfileAction(cardId);
            if (!result.success || !result.data) {
                setProfileError(
                    result.error ?? "Não foi possível carregar os dados do cartão."
                );
                setProfile(null);
            } else {
                setProfile(result.data);
                setProfileError(null);
            }
        } catch (error) {
            console.error("[useCardProfileData] Erro crítico ao buscar cartão:", error);
            setProfileError(
                "Ocorreu um erro inesperado ao carregar o perfil do cartão."
            );
            setProfile(null);
        } finally {
            setIsLoadingProfile(false);
        }
    }, [cardId]);

    const reloadProfile = useCallback(async () => {
        setIsLoadingProfile(true);
        setProfileError(null);
        await fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            if (!initialProfile) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                void fetchProfile();
            }
            return;
        }
        void fetchProfile();
    }, [fetchProfile, initialProfile]);

    // Recarrega silenciosamente quando retorna do modal de rota interceptada (/edit -> /cards/[id])
    useEffect(() => {
        const wasInSubRoute =
            prevPathnameRef.current !== pathname &&
            prevPathnameRef.current.endsWith("/edit");
        prevPathnameRef.current = pathname;

        if (wasInSubRoute && pathname === `/cards/${cardId}`) {
            void fetchProfile();
        }
    }, [pathname, cardId, fetchProfile]);

    return {
        profile,
        isLoadingProfile,
        profileError,
        reloadProfile,
    };
}

export function useCardCycleNavigation(
    profile: CardProfile | null,
    filters: WalletMovementFilters,
    applyFilters: (updates: Partial<WalletMovementFilters>) => void
) {
    const cycles = useMemo(() => profile?.cycles ?? [], [profile]);

    const activeCycleIndex = useMemo(() => {
        if (cycles.length === 0) return -1;
        if (filters.from && filters.to) {
            const matchedIdx = cycles.findIndex(
                (c) => c.from === filters.from && c.to === filters.to
            );
            if (matchedIdx !== -1) return matchedIdx;
        }
        const openIdx = cycles.findIndex((c) => c.status === "OPEN");
        return openIdx !== -1 ? openIdx : cycles.length - 1;
    }, [cycles, filters.from, filters.to]);

    const activeCycle: CardCycleOption | null =
        activeCycleIndex >= 0 ? (cycles[activeCycleIndex] ?? null) : null;

    const hasPrevCycle = activeCycleIndex > 0;
    const hasNextCycle =
        activeCycleIndex !== -1 && activeCycleIndex < cycles.length - 1;

    const onPrevCycle = useCallback(() => {
        if (!hasPrevCycle) return;
        const target = cycles[activeCycleIndex - 1];
        if (target) {
            applyFilters({ from: target.from, to: target.to });
        }
    }, [hasPrevCycle, cycles, activeCycleIndex, applyFilters]);

    const onNextCycle = useCallback(() => {
        if (!hasNextCycle) return;
        const target = cycles[activeCycleIndex + 1];
        if (target) {
            applyFilters({ from: target.from, to: target.to });
        }
    }, [hasNextCycle, cycles, activeCycleIndex, applyFilters]);

    const effectiveFilters = useMemo<WalletMovementFilters>(() => {
        return {
            ...filters,
            from: activeCycle?.from ?? filters.from,
            to: activeCycle?.to ?? filters.to,
        };
    }, [filters, activeCycle]);

    const activeExtraFilterCount = useMemo(() => {
        let count = 0;
        if (filters.q && filters.q.trim().length > 0) count++;
        if (filters.direction) count++;
        if (filters.types && filters.types.length > 0) count += filters.types.length;
        if (filters.includeReversed) count++;
        return count;
    }, [filters]);

    const clearExtraFilters = useCallback(() => {
        applyFilters({
            q: undefined,
            direction: undefined,
            types: undefined,
            includeReversed: undefined,
        });
    }, [applyFilters]);

    const cycleNavigation: CardCycleNavigationContext = useMemo(
        () => ({
            activeCycle,
            hasPrevCycle,
            hasNextCycle,
            onPrevCycle,
            onNextCycle,
        }),
        [activeCycle, hasPrevCycle, hasNextCycle, onPrevCycle, onNextCycle]
    );

    return {
        cycleNavigation,
        effectiveFilters,
        activeExtraFilterCount,
        clearExtraFilters,
    };
}