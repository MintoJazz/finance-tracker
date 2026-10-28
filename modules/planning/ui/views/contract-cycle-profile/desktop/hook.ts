"use client";

import { useContractCycleProfileData } from "../hooks/use-contract-cycle-profile-data";
import {
    ContractCycleProfileDesktopProps,
    ContractCycleProfileInput,
} from "../types";

export function useContractCycleProfileDesktop(
    input: ContractCycleProfileInput
): ContractCycleProfileDesktopProps {
    const data = useContractCycleProfileData(input);
    return data;
}
