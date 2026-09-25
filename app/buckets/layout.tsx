import { ReactNode } from "react"

interface BucketsLayoutProps {
    children: ReactNode
    modal: ReactNode
}

export default function BucketsLayout({ children, modal }: BucketsLayoutProps) {
    return (
        <>
            {children}
            {modal}
        </>
    )
}
