"use server"

import { redirect } from "next/navigation"
import { LoginFormType } from "../../core/schemas/login.schema"
import { IdentityFactory } from "../../infra/factories/identity.factory";
import { SessionHandler } from "../../infra/handlers/session.handler";

export async function onLogin(input: LoginFormType) {
    const useCase = IdentityFactory.makeLogIn();
    const result = await useCase.execute(input);

    if (!result.success) return result;

    await SessionHandler.create(result.data.partyId);
    redirect("/");
}