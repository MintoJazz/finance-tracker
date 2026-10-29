import type { NextRequest } from 'next/server'
import { AuthMiddlewareGuard } from './modules/auth/infra/handlers/proxy.handler'

export async function proxy(request: NextRequest) {
    return AuthMiddlewareGuard.handle(request)
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}