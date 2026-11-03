import { redirect } from "next/navigation"
import { ViewContainer } from "@/components/adaptive"
import { MasterDetailConfig } from "@/components/master-detail"
import { getDeviceViewport } from "@/lib/device"
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler"
interface CategoriesLayoutProps {
    children: React.ReactNode
    master: React.ReactNode
    modal: React.ReactNode
}

export default async function CategoriesLayout({ children, master, modal }: CategoriesLayoutProps) {
    const session = await SessionHandler.getSession()
    if (!session) redirect("/login")

    const initialViewport = await getDeviceViewport()

    // master (slot @master) e detail (children) são Server Components gerenciados pelo Next.js
    // e passados como props para o ViewContainer (Client Component).
    return (
        <>
            <ViewContainer
                initialViewport={initialViewport}
                data={{ master, detail: children }}
                {...MasterDetailConfig}
            />
            {modal}
        </>
    )
}
