import { NextRequest, NextResponse } from 'next/server'
import { decryptToken } from '../cryptography/jwt-utils'

const ROTAS_PUBLICAS = new Set(['/login', '/signup'])
const NOME_DO_COOKIE = 'session_token'

export class AuthMiddlewareGuard {
    static async handle(request: NextRequest): Promise<NextResponse> {
        const { pathname } = request.nextUrl
        const token = request.cookies.get(NOME_DO_COOKIE)?.value
        const session = token ? await decryptToken(token) : null
        const ehRotaPublica = ROTAS_PUBLICAS.has(pathname)

        if (!session && !ehRotaPublica) {
            const response = NextResponse.redirect(new URL('/login', request.url))
            if (token) response.cookies.delete(NOME_DO_COOKIE)
            return response
        }

        if (session && ehRotaPublica) return NextResponse.redirect(new URL('/', request.url))

        const response = NextResponse.next()
        if (token && !session) response.cookies.delete(NOME_DO_COOKIE)
        return response
    }
}