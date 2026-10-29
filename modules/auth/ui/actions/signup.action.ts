"use server"

import { SignupFormType } from "@/modules/auth/models/signup.schema"
import { AuthFactory } from "@/modules/auth/infra/factories/auth.factory"
import { SessionHandler } from "../../infra/handlers/session.handler"

export async function onSignup(input: SignupFormType) {
    const useCase = AuthFactory.makeSignUp()
    const result = await useCase.execute(input)

    if (!result.success) return result

    const { partyId, contextId } = result.data
    await SessionHandler.create(partyId, contextId)

    return result
}
