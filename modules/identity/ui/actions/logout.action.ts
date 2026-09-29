"use server"

import { redirect } from "next/navigation"
import { SessionHandler } from "../../infra/handlers/session.handler"

export async function onLogout() {
    await SessionHandler.destroy()
    redirect("/login")
}