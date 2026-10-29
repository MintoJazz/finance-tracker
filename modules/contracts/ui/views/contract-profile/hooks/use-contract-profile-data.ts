"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useBreadcrumbLabel } from "@/components/header";
import { ContractProfile } from "@/modules/contracts/models/contract-profile.schema";
import { getContractProfileAction } from "@/modules/contracts/ui/actions/get-contract-profile.action";


export interface UseContractProfileDataReturn {
    profile: ContractProfile | null;
    isLoadingProfile: boolean;
    profileError: string | null;
    reloadProfile: () => Promise<void>;
}

export function useContractProfileData(
    contractId: string | number,
    initialProfile?: ContractProfile | null
): UseContractProfileDataReturn {
    const numericId = typeof contractId === "string" ? Number(contractId) : contractId;
    const pathname = usePathname();
    const prevPathnameRef = useRef<string>(pathname);
    const hasMountedRef = useRef(false);

    const [profile, setProfile] = useState<ContractProfile | null>(initialProfile ?? null);
    const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(!initialProfile);
    const [profileError, setProfileError] = useState<string | null>(null);

    useBreadcrumbLabel("contractProfile", profile?.name);

    const fetchProfile = useCallback(async () => {
        if (!numericId || Number.isNaN(numericId)) {
            setProfileError("ID de contrato inválido.");
            setIsLoadingProfile(false);
            return;
        }

        try {
            const result = await getContractProfileAction(numericId);
            if (!result.success || !result.data) {
                setProfileError(
                    result.error ?? "Não foi possível carregar os dados do contrato."
                );
                setProfile(null);
            } else {
                setProfile(result.data);
                setProfileError(null);
            }
        } catch (error) {
            console.error("[useContractProfileData] Erro crítico ao buscar contrato:", error);
            setProfileError("Ocorreu um erro inesperado ao carregar o perfil do contrato.");
            setProfile(null);
        } finally {
            setIsLoadingProfile(false);
        }
    }, [numericId]);

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

    // Recarrega silenciosamente quando retorna de sub-rota de edição (/contracts/[id]/edit -> /contracts/[id])
    useEffect(() => {
        const wasInSubRoute =
            prevPathnameRef.current !== pathname &&
            prevPathnameRef.current.endsWith("/edit");
        prevPathnameRef.current = pathname;

        if (wasInSubRoute && pathname === `/contracts/${numericId}`) {
            void fetchProfile();
        }
    }, [pathname, numericId, fetchProfile]);

    return {
        profile,
        isLoadingProfile,
        profileError,
        reloadProfile,
    };
}
