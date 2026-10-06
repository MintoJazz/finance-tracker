"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { WalletProfile } from "@/modules/account/core/schemas/wallet-profile.schema";
import { getWalletProfileAction } from "@/modules/account/ui/actions/get-wallet-profile.action";

export interface UseWalletProfileDataReturn {
    profile: WalletProfile | null;
    isLoadingProfile: boolean;
    profileError: string | null;
    reloadProfile: () => Promise<void>;
}

export function useWalletProfileData(walletId: number): UseWalletProfileDataReturn {
    const pathname = usePathname();
    const prevPathnameRef = useRef<string>(pathname);

    const [profile, setProfile] = useState<WalletProfile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
    const [profileError, setProfileError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        try {
            const result = await getWalletProfileAction(walletId);
            if (!result.success || !result.data) {
                setProfileError(result.error ?? "Não foi possível carregar os dados da carteira.");
                setProfile(null);
            } else {
                setProfile(result.data);
                setProfileError(null);
            }
        } catch (error) {
            console.error("[useWalletProfileData] Erro crítico ao buscar carteira:", error);
            setProfileError("Ocorreu um erro inesperado ao carregar o perfil da carteira.");
            setProfile(null);
        } finally {
            setIsLoadingProfile(false);
        }
    }, [walletId]);

    const reloadProfile = useCallback(async () => {
        setIsLoadingProfile(true);
        setProfileError(null);
        await fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchProfile();
    }, [fetchProfile]);

    // Recarrega silenciosamente quando retorna do modal de rota interceptada (/edit -> /wallets/[id])
    useEffect(() => {
        const wasInSubRoute = prevPathnameRef.current !== pathname && prevPathnameRef.current.endsWith("/edit");
        prevPathnameRef.current = pathname;

        if (wasInSubRoute && pathname === `/wallets/${walletId}`) {
            void fetchProfile();
        }
    }, [pathname, walletId, fetchProfile]);

    return {
        profile,
        isLoadingProfile,
        profileError,
        reloadProfile,
    };
}