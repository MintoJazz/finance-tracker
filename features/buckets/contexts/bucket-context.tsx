'use client'

import { createContext, useContext, ReactNode, useMemo } from "react";
import { BucketOption } from "@/types/database";

interface Props {
    buckets: BucketOption[];
}

const BucketContext = createContext<Props | undefined>(undefined);

export function useBucketsContext() {
    const context = useContext(BucketContext);
    if (!context) {
        throw new Error("useBucketsContext deve ser usado dentro de um BucketProvider");
    }
    return context;
}

export function BucketProvider({ children, buckets }: { children: ReactNode; buckets: BucketOption[] }) {
    const contextValue = useMemo(() => ({ buckets }), [buckets]);
    return (
        <BucketContext.Provider value={contextValue}>
            {children}
        </BucketContext.Provider>
    );
}