import { AppSidebar } from "@/components/sidebar"
import { getUserContextAction } from "@/modules/identity/ui/actions/get-user-context.action"
import { AppHeader, HeaderProvider } from "@/components/header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default async function PrivateLayout({
  children
}: {
  children: React.ReactNode
}) {
  const userContextResult = await getUserContextAction()
  const userContext = userContextResult.success ? userContextResult.data : null

  return (
    <SidebarProvider>
      <AppSidebar userContext={userContext} />
      <SidebarInset>
        <HeaderProvider>
          <AppHeader />
          <main>
            {children}
          </main>
        </HeaderProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
