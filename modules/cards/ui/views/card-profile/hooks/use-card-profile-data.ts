"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CardProfile } from "@/modules/cards/models/card-profile.schema";
import { getCardProfileAction } from "@/modules/cards/ui/actions/get-card-profile.action";

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
