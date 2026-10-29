"use server"

import { redirect } from "next/navigation"
import { LoginFormType } from "@/modules/auth/models/login.schema"
import { AuthFactory } from "@/modules/auth/infra/factories/auth.factory";
import { SessionHandler } from "../../infra/handlers/session.handler";

export async function onLogin(input: LoginFormType) {
    const useCase = AuthFactory.makeLogIn();
    const result = await useCase.execute(input);

    if (!result.success) return result;
    
    const { partyId, contextId } = result.data;
    await SessionHandler.create(partyId, contextId as number);
    redirect("/");
}