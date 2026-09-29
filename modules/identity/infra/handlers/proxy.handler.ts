import { NextRequest, NextResponse } from 'next/server'

// O módulo de identidade é o dono destas regras
const ROTAS_PUBLICAS = new Set(['/login', '/signup'])
const NOME_DO_COOKIE = 'session_token'

export class AuthMiddlewareGuard {
    static handle(request: NextRequest): NextResponse {
        const urlCorrente = request.nextUrl.pathname
        const temCookie = request.cookies.has(NOME_DO_COOKIE)
        const ehRotaPublica = ROTAS_PUBLICAS.has(urlCorrente)

        if (!temCookie && !ehRotaPublica) return NextResponse.redirect(new URL('/login', request.url))
        if (temCookie && ehRotaPublica) return NextResponse.redirect(new URL('/', request.url))

        return NextResponse.next()
    }
}