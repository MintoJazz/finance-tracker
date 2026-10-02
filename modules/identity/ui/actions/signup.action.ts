"use server"

import { SignupFormType } from "../../core/schemas/signup.schema"
import { IdentityFactory } from "../../infra/factories/identity.factory"
import { SessionHandler } from "../../infra/handlers/session.handler"

export async function onSignup(input: SignupFormType) {
    const useCase = IdentityFactory.makeSignUp()
    const result = await useCase.execute(input)

    if (!result.success) return result

    const { partyId, contextId } = result.data
    await SessionHandler.create(partyId, contextId)

    return result
}
