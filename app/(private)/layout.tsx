import { AppSidebar } from "@/components/sidebar"
import { getUserContextAction } from "@/modules/auth/ui/actions/get-user-context.action"
import { AppHeader, HeaderProvider } from "@/components/header"
import {
  GlobalActionsMobile,
  GlobalActionsProvider,
} from "@/components/global-actions"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default async function PrivateLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  const userContextResult = await getUserContextAction()
  const userContext = userContextResult.success ? userContextResult.data : null

  return (
    <SidebarProvider>
      <AppSidebar userContext={userContext} />
      <SidebarInset>
        <HeaderProvider>
          <GlobalActionsProvider>
            <AppHeader />
            <main className="pb-[calc(2rem+env(safe-area-inset-bottom))] md:pb-0">
              {children}
            </main>
            <GlobalActionsMobile />
            {modal}
          </GlobalActionsProvider>
        </HeaderProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
