"use client"

import { UserOption } from "@/types/database"
import { createContext, ReactNode, useContext, useMemo } from "react"

interface ContextData {
    users: UserOption[]
}

const UserContext = createContext<ContextData | undefined>(undefined)

interface ProviderProps {
    children: ReactNode
    users: UserOption[]
}

export function UserProvider({ children, users }: ProviderProps) {
    const contextValue = useMemo(() => ({ users }), [users]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    )
}

export function useUsersContext() {
    const context = useContext(UserContext)
    
    if (context === undefined) {
        throw new Error("useUsersContext deve ser usado dentro de um UserProvider")
    }
    
    return context
}