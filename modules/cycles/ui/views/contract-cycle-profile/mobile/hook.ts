"use client";

import { useContractCycleProfileData } from "../hooks/use-contract-cycle-profile-data";
import {
    ContractCycleProfileInput,
    ContractCycleProfileMobileProps,
} from "../types";

export function useContractCycleProfileMobile(
    input: ContractCycleProfileInput
): ContractCycleProfileMobileProps {
    const data = useContractCycleProfileData(input);
    return data;
}
