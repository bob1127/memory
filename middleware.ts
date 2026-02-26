// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
    // 網站正式上線，全部直接放行！
    return NextResponse.next()
}

// 設定 Middleware 作用範圍
export const config = {
    matcher: '/:path*',
}