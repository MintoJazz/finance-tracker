"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RecurrenceProfile } from "@/modules/recurrences/models/schemas/recurrence-profile.schema";
import { getRecurrenceProfileAction } from "@/modules/recurrences/ui/actions/get-recurrence-profile.action";

export interface UseRecurrenceProfileDataReturn {
    profile: RecurrenceProfile | null;
    isLoadingProfile: boolean;
    profileError: string | null;
    reloadProfile: () => Promise<void>;
}

export function useRecurrenceProfileData(
    balanceId: number,
    initialProfile?: RecurrenceProfile | null
): UseRecurrenceProfileDataReturn {
    const hasMountedRef = useRef(false);
    const [profile, setProfile] = useState<RecurrenceProfile | null>(
        initialProfile ?? null
    );
    const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(
        !initialProfile
    );
    const [profileError, setProfileError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        try {
            const result = await getRecurrenceProfileAction(balanceId);
            if (!result.success || !result.data) {
                setProfileError(
                    result.error ?? "Não foi possível carregar os dados da recorrência."
                );
                setProfile(null);
            } else {
                setProfile(result.data);
                setProfileError(null);
            }
        } catch (error) {
            console.error(
                `[useRecurrenceProfileData] Erro ao buscar perfil ${balanceId}:`,
                error
            );
            setProfileError("Ocorreu um erro ao carregar a recorrência.");
            setProfile(null);
        } finally {
            setIsLoadingProfile(false);
        }
    }, [balanceId]);

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

    return {
        profile,
        isLoadingProfile,
        profileError,
        reloadProfile,
    };
}

