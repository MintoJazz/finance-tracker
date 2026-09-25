import { ReactNode } from "react"

interface PlannerLayoutProps {
    children: ReactNode
    modal: ReactNode
}

export default function PlannerLayout({ children, modal }: PlannerLayoutProps) {
    return (
        <>
            {children}
            {modal}
        </>
    )
}
