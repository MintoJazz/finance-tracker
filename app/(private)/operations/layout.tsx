import { redirect } from "next/navigation"
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler"

interface OperationsLayoutProps {
  children: React.ReactNode
  modal: React.ReactNode
}

export default async function OperationsLayout({
  children,
  modal,
}: OperationsLayoutProps) {
  const session = await SessionHandler.getSession()
  if (!session) redirect("/login")

  return (
    <>
      {children}
      {modal}
    </>
  )
}

